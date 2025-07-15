package com.moujib.lookmax_backend.configurations;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.moujib.lookmax_backend.temporary.FirebaseUserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println("🔍 Processing request: " + request.getRequestURI());
        System.out.println("🔑 Auth header present: " + (authHeader != null));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);
            System.out.println("🎫 Token length: " + idToken.length());

            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                System.out.println("✅ Token verified successfully for user: " + decodedToken.getUid());

                FirebaseUserPrincipal principal = new FirebaseUserPrincipal(
                        decodedToken.getUid(),
                        decodedToken.getEmail(),
                        decodedToken.getName()
                );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, new ArrayList<>());

                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("🔐 Authentication set in SecurityContext");

            } catch (FirebaseAuthException e) {
                System.err.println("❌ Firebase token verification failed: " + e.getMessage());
                System.err.println("Error code: " + e.getErrorCode());
                logger.warn("Invalid Firebase token: " + e.getMessage());
            }
        } else {
            System.out.println("ℹ️ No Bearer token found in Authorization header");
        }

        filterChain.doFilter(request, response);
    }
}