package com.example.auth_service;

import java.util.List;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import com.example.auth_service.service.UserService;

@SpringBootApplication
@ComponentScan(basePackages = {
	"com.example.auth_service", 
	"com.example.auth_service.config",
	"com.example.auth_service.controller",
	"com.example.auth_service.model",
	"com.example.auth_service.service"}) 
public class AuthServiceApplication {
	
	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}

	@Bean
	public ApplicationRunner createDefaultAdmin(UserService userService) {
		return args -> {
			if (userService.findByUsername("admin") == null) {
				userService.registerUser("admin", "adminpassword", List.of("ROLE_ADMIN"));
				System.out.println("Default admin user created: admin/adminpassword");
			}
		};
	}

        }

