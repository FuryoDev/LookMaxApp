package com.moujib.lookmax_backend.configurations;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-key:}")
    private String serviceAccountKey;

    @Value("${firebase.service-account-file:firebase-service-account.json}")
    private String serviceAccountFile;

    @PostConstruct
    public void initialize() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            System.out.println("🔧 Initializing Firebase Admin SDK...");

            GoogleCredentials credentials = getCredentials();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase Admin SDK initialized successfully");
        } else {
            System.out.println("ℹ️ Firebase Admin SDK already initialized");
        }
    }

    private GoogleCredentials getCredentials() throws IOException {
        System.out.println("🔍 Looking for Firebase credentials...");

        if (serviceAccountKey != null && !serviceAccountKey.isEmpty()) {
            System.out.println("📝 Using service account key from environment variable");
            InputStream stream = new ByteArrayInputStream(
                    serviceAccountKey.getBytes(StandardCharsets.UTF_8)
            );
            return GoogleCredentials.fromStream(stream);
        }

        Resource resource = new ClassPathResource(serviceAccountFile);
        if (resource.exists()) {
            System.out.println("📁 Using service account file: " + serviceAccountFile);
            return GoogleCredentials.fromStream(resource.getInputStream());
        }

        System.out.println("🌍 Using default application credentials");
        return GoogleCredentials.getApplicationDefault();
    }
}