package com.moujib.lookmax_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class LookmaxBackendApplication {

	public static void main(String[] args) {
		System.out.println("🚀 Démarrage du backend LookMax...");

		ConfigurableApplicationContext context = SpringApplication.run(LookmaxBackendApplication.class, args);

		String port = context.getEnvironment().getProperty("server.port", "8080");
		System.out.println("✅ Backend démarré avec succès sur le port " + port);
		System.out.println("🌐 Endpoints disponibles:");
		System.out.println("   - http://localhost:" + port + "/api/main");
		System.out.println("   - http://localhost:" + port + "/api/health");
		System.out.println("   - http://localhost:" + port + "/api/test");
	}
}
