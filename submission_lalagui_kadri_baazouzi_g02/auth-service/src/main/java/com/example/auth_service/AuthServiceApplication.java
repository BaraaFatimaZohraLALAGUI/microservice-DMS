package com.example.auth_service;

import java.util.Date;
import java.util.List;
import java.util.ArrayList;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import com.example.auth_service.model.UserProfile;
import com.example.auth_service.service.UserProfileService;
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
	public ApplicationRunner createDefaultAdmin(UserService userService, UserProfileService userProfileService) {
		return args -> {
			// Always create or update the admin user to ensure it exists
			System.out.println("Checking for admin user...");
			
			User adminUser = userService.findByUsername("admin");
			
			if (adminUser == null) {
				System.out.println("Admin user not found in memory, creating...");
				// Create base admin user with credentials
				adminUser = userService.registerUser("admin", "adminpassword", List.of("ROLE_ADMIN"));
				System.out.println("Admin user created with roles: " + adminUser.getRoles());
			} else {
				System.out.println("Admin user found in memory with roles: " + adminUser.getRoles());
				
				// Ensure admin has ROLE_ADMIN
				if (!adminUser.getRoles().contains("ROLE_ADMIN")) {
					List<String> updatedRoles = new ArrayList<>(adminUser.getRoles());
					updatedRoles.add("ROLE_ADMIN");
					adminUser = userService.updateUser("admin", null, updatedRoles);
					System.out.println("Updated admin user roles: " + adminUser.getRoles());
				}
			}
			
			// Check if admin profile exists in database
			UserProfile existingProfile = userProfileService.getProfileByUsername("admin");
			
			if (existingProfile == null) {
				System.out.println("Admin profile not found in database, creating...");
				// Create admin user profile with additional information
				UserProfile adminProfile = new UserProfile();
				adminProfile.setUsername("admin");
				adminProfile.setName("System Administrator");
				adminProfile.setEmail("admin@system.com");
				adminProfile.setPhone("123-456-7890");
				adminProfile.setPosition("System Administrator");
				adminProfile.setDepartment("IT");
				adminProfile.setStatus("Active");
				adminProfile.setAddress("Main Office");
				adminProfile.setHireDate(new Date()); // Current date as hire date
				adminProfile.setEmployeeId(1000); // Special employee ID for admin
				
				// Save the admin profile
				try {
					UserProfile savedProfile = userProfileService.saveProfile(adminProfile);
					System.out.println("Default admin profile created: " + savedProfile.getName() + " / " + savedProfile.getUsername());
				} catch (Exception e) {
					System.err.println("Error creating admin profile: " + e.getMessage());
					e.printStackTrace();
				}
			} else {
				System.out.println("Admin profile found in database: " + existingProfile.getName() + " / " + existingProfile.getUsername());
				
				// Update the existing profile with proper information
				boolean needsUpdate = false;
				
				if (existingProfile.getName() == null || existingProfile.getName().isEmpty()) {
					existingProfile.setName("System Administrator");
					needsUpdate = true;
				}
				
				if (existingProfile.getEmail() == null || existingProfile.getEmail().isEmpty()) {
					existingProfile.setEmail("admin@system.com");
					needsUpdate = true;
				}
				
				if (existingProfile.getPhone() == null || existingProfile.getPhone().isEmpty()) {
					existingProfile.setPhone("123-456-7890");
					needsUpdate = true;
				}
				
				if (existingProfile.getPosition() == null || existingProfile.getPosition().isEmpty()) {
					existingProfile.setPosition("System Administrator");
					needsUpdate = true;
				}
				
				if (existingProfile.getDepartment() == null || existingProfile.getDepartment().isEmpty()) {
					existingProfile.setDepartment("IT");
					needsUpdate = true;
				}
				
				if (existingProfile.getStatus() == null || existingProfile.getStatus().isEmpty()) {
					existingProfile.setStatus("Active");
					needsUpdate = true;
				}
				
				if (existingProfile.getAddress() == null || existingProfile.getAddress().isEmpty()) {
					existingProfile.setAddress("Main Office");
					needsUpdate = true;
				}
				
				// Only update hire date if it's null
				if (existingProfile.getHireDate() == null) {
					existingProfile.setHireDate(new Date());
					needsUpdate = true;
				}
				
				// Only update employee ID if it's null
				if (existingProfile.getEmployeeId() == null) {
					existingProfile.setEmployeeId(1000);
					needsUpdate = true;
				}
				
				// Save the updated profile if needed
				if (needsUpdate) {
					try {
						UserProfile updatedProfile = userProfileService.saveProfile(existingProfile);
						System.out.println("Admin profile updated: " + updatedProfile.getName() + " / " + updatedProfile.getUsername());
					} catch (Exception e) {
						System.err.println("Error updating admin profile: " + e.getMessage());
						e.printStackTrace();
					}
				}
			}
		};
	}
}

