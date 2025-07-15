package com.moujib.lookmax_backend.configurations;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.moujib.lookmax_backend.temporary.FirebaseUserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        logger.debug("🔍 Processing request: {} {}", request.getMethod(), path);

        // Exclure certains endpoints de l'authentification
        if (shouldSkipAuthentication(path)) {
            logger.debug("⏭️ Skipping authentication for public endpoint: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        logger.debug("🔑 Auth header present: {}", authHeader != null);

        if (StringUtils.hasText(authHeader) && authHeader.startsWith(BEARER_PREFIX)) {
            String idToken = authHeader.substring(BEARER_PREFIX.length());
            logger.debug("🎫 Token extracted, length: {}", idToken.length());

            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                logger.info("✅ Token verified successfully for user: {}", decodedToken.getUid());

                // Créer le principal avec les informations du token
                FirebaseUserPrincipal principal = new FirebaseUserPrincipal(
                        decodedToken.getUid(),
                        decodedToken.getEmail(),
                        decodedToken.getName() != null ? decodedToken.getName() : decodedToken.getEmail()
                );

                // Extraire les rôles/claims personnalisés si présents
                List<SimpleGrantedAuthority> authorities = extractAuthorities(decodedToken);

                // Créer l'objet d'authentification
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);

                // Ajouter des détails supplémentaires
                authentication.setDetails(decodedToken.getClaims());

                // Définir l'authentification dans le contexte de sécurité
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.debug("🔐 Authentication set in SecurityContext for user: {}", principal.uid());

            } catch (FirebaseAuthException e) {
                logger.error("❌ Firebase token verification failed: {}", e.getMessage());
                logger.debug("Error details: ", e);

                // Optionnel : Envoyer une réponse d'erreur directement
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid token\", \"message\": \"" +
                        e.getMessage() + "\"}");
                return;
            } catch (Exception e) {
                logger.error("❌ Unexpected error during authentication: {}", e.getMessage());
                logger.debug("Error details: ", e);
            }
        } else {
            logger.debug("ℹ️ No Bearer token found in Authorization header");
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipAuthentication(String path) {
        // Liste des endpoints publics qui ne nécessitent pas d'authentification
        return path.startsWith("/api/health") ||
                path.startsWith("/api/test") ||
                path.startsWith("/api/cors-test") ||
                path.startsWith("/actuator") ||
                path.equals("/error");
    }

    private List<SimpleGrantedAuthority> extractAuthorities(FirebaseToken token) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        // Rôle par défaut pour tous les utilisateurs authentifiés
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        // Extraire les rôles personnalisés des claims si présents
        Map<String, Object> claims = token.getClaims();
        if (claims.containsKey("roles")) {
            Object rolesObj = claims.get("roles");
            if (rolesObj instanceof List<?>) {
                List<?> roles = (List<?>) rolesObj;
                for (Object role : roles) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toString().toUpperCase()));
                }
            }
        }

        // Vérifier si l'utilisateur est admin
        if (claims.containsKey("admin") && Boolean.TRUE.equals(claims.get("admin"))) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return authorities;
    }
}