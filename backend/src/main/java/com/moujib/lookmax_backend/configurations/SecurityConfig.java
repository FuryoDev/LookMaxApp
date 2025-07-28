package com.moujib.lookmax_backend.configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;

    private final FirebaseAuthenticationFilter firebaseAuthenticationFilter;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource, FirebaseAuthenticationFilter firebaseAuthenticationFilter) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.firebaseAuthenticationFilter = firebaseAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health", "/api/test", "/api/cors-test").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/main").authenticated()
                        .requestMatchers("/api/user/**").authenticated()
                        .anyRequest().authenticated()
                )

                // Ajouter le filtre Firebase avant le filtre d'authentification Spring
                .addFilterBefore(firebaseAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class)

                // Gestion des exceptions
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" +
                                    authException.getMessage() + "\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"" +
                                    accessDeniedException.getMessage() + "\"}");
                        })
                );

        return http.build();
    }
}