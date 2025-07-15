package com.moujib.lookmax_backend.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")  // Permet tous les origins temporairement
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
