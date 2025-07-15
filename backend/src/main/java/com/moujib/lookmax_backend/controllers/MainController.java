package com.moujib.lookmax_backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)  // CORS au niveau du contrôleur
public class MainController {

    @GetMapping("/main")
    public String getMainControllerSomething() {
        System.out.println("✅ Endpoint /api/main appelé avec succès");
        return "String chain from the backend";
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("service", "LookMax Backend");
        response.put("version", "1.0.0");

        System.out.println("✅ Health check appelé");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test endpoint working!");
        response.put("cors", "enabled");
        response.put("timestamp", System.currentTimeMillis());

        System.out.println("✅ Test endpoint appelé");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/cors-test", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> corsTest() {
        System.out.println("✅ CORS preflight request reçu");
        return ResponseEntity.ok().build();
    }
}