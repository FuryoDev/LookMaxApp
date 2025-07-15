package com.moujib.lookmax_backend.controllers;

import com.moujib.lookmax_backend.temporary.FirebaseUserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MainController {

    private static final Logger logger = LoggerFactory.getLogger(MainController.class);

    @GetMapping("/main")
    public ResponseEntity<Map<String, Object>> getMainControllerSomething(
            @AuthenticationPrincipal FirebaseUserPrincipal principal) {

        logger.info("✅ Endpoint /api/main appelé avec succès");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "String chain from the backend");
        response.put("timestamp", System.currentTimeMillis());

        if (principal != null) {
            response.put("user", Map.of(
                    "uid", principal.uid(),
                    "email", principal.email(),
                    "name", principal.getName()
            ));
            logger.info("👤 Utilisateur authentifié: {}", principal.email());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("service", "LookMax Backend");
        response.put("version", "1.0.0");

        logger.debug("✅ Health check appelé");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test endpoint working!");
        response.put("cors", "enabled");
        response.put("timestamp", System.currentTimeMillis());

        logger.debug("✅ Test endpoint appelé");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/cors-test", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> corsTest() {
        logger.debug("✅ CORS preflight request reçu");
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "Authorization, Content-Type")
                .build();
    }

    @GetMapping("/user/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(
            @AuthenticationPrincipal FirebaseUserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "Unauthorized",
                    "message", "User not authenticated"
            ));
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("uid", principal.uid());
        profile.put("email", principal.email());
        profile.put("name", principal.getName());
        profile.put("authorities", SecurityContextHolder.getContext()
                .getAuthentication().getAuthorities());

        logger.info("👤 Profile requested for user: {}", principal.email());
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/test-auth")
    public ResponseEntity<Map<String, Object>> testAuthentication(
            Principal principal,
            Authentication authentication) {

        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", authentication != null && authentication.isAuthenticated());
        response.put("principal", principal != null ? principal.getName() : null);
        response.put("authorities", authentication != null ? authentication.getAuthorities() : null);

        return ResponseEntity.ok(response);
    }
}