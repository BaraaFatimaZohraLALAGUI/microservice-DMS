package com.example.auth_service.controller;

import com.example.auth_service.config.JwtUtil;
import com.example.auth_service.model.User; // Import your User model
import com.example.auth_service.model.UserProfile; // Import UserProfile model
import com.example.auth_service.service.UserService; // Import UserService
import com.example.auth_service.service.UserProfileService; // Import UserProfileService

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*; // Import RequestBody and PathVariable if needed
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

import java.util.Collections; // For default roles
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService; // Inject UserService
    private final UserProfileService userProfileService; // Inject UserProfileService

    // DTO for signup request
    public record SignupRequest(String username, String password) {}

    @PostMapping("/signup")
    public ResponseEntity<?> signupUser(@RequestBody SignupRequest signupRequest) {
        log.info("Signup request received for username: {}", signupRequest.username());
        try {
            // Assign a default role, e.g., "ROLE_USER"
            User newUser = userService.registerUser(
                signupRequest.username(),
                signupRequest.password(),
                Collections.singletonList("ROLE_USER") // Default role
            );
            // Return minimal user info (avoid sending password back)
            Map<String, Object> response = new HashMap<>();
            response.put("username", newUser.getUsername());
            response.put("roles", newUser.getRoles());
            log.info("User registered successfully: {}", newUser.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Signup failed for username {}: {}", signupRequest.username(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @PostMapping("/token")
    public ResponseEntity<?> generateToken(Authentication authentication) {
        // Basic Auth has already been handled by Spring Security IF this method is reached.
        // The 'authentication' object holds the successfully authenticated principal.

        if (authentication == null || !authentication.isAuthenticated()) {
             log.warn("generateToken called but authentication is null or not authenticated.");
             // This case shouldn't typically happen if SecurityConfig is correct, but good practice to check.
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        log.info("Token request received for authenticated principal: {}", authentication.getName());

        Object principal = authentication.getPrincipal();
        String token = null;

        try {
            if (principal instanceof UserDetails userDetails) { // Use pattern variable binding
                log.debug("Principal is UserDetails object. Extracting info for JWT generation...");
                String username = userDetails.getUsername();

                // --- FIX: Fetch the User object from UserService --- 
                User user = userService.findByUsername(username);
                if (user == null) {
                    // This shouldn't happen if authentication succeeded, but good practice
                    log.error("Authenticated user '{}' not found in UserService.", username);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("User data inconsistency.");
                }
                // --- FIX: Pass the User object to generateToken --- 
                token = jwtUtil.generateToken(user);
                log.info("Token generated successfully for user: {}", username);

            } else {
                // Handle cases where the principal might not be UserDetails (less common with Basic Auth)
                log.warn("Authenticated principal is not an instance of UserDetails: {}", principal.getClass().getName());
                // Optionally generate a token based on principal.toString() or return an error
                // For simplicity, returning error here
                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected principal type.");
            }

            // Return the generated token
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error generating token for principal {}: {}", authentication.getName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating token.");
        }
    }

    /**
     * Get the current user's profile information
     * This is a convenient endpoint for clients to fetch user data without using admin endpoints
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("getCurrentUser called but authentication is null or not authenticated.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
        }

        String username = authentication.getName();
        log.info("Current user info request received for authenticated principal: {}", username);

        try {
            User user = userService.findByUsername(username);
            
            if (user == null && !"admin".equals(username)) {
                log.error("Authenticated user '{}' not found in UserService.", username);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("User data inconsistency.");
            }
            
            // Special handling for admin user if not found in memory
            if (user == null && "admin".equals(username)) {
                log.info("Admin user not found in memory but authenticated - creating special instance");
                user = new User("admin", "[PROTECTED]", List.of("ROLE_ADMIN"));
            }
            
            // Create response with user data
            Map<String, Object> userData = new HashMap<>();
            userData.put("username", user.getUsername());
            userData.put("roles", user.getRoles() != null ? user.getRoles() : new ArrayList<>());
            
            // Add profile data if exists
            UserProfile profile = userProfileService.getProfileByUsername(username);
            log.info("Profile for user {}: {}", username, profile != null ? "found" : "not found");
            
            if (profile != null) {
                addProfileDataToMap(userData, profile);
                log.info("Profile data for {}: name={}, email={}", username, profile.getName(), profile.getEmail());
            } else if (username.equals("admin")) {
                // Always ensure admin has profile data even if not in database yet
                log.info("Creating default profile data for admin user");
                
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
                
                // Save the profile
                try {
                    UserProfile savedProfile = userProfileService.saveProfile(adminProfile);
                    log.info("Admin profile created and saved: {}", savedProfile.getName());
                    
                    // Use the saved profile data
                    addProfileDataToMap(userData, savedProfile);
                } catch (Exception e) {
                    log.error("Error saving admin profile: {}", e.getMessage(), e);
                    
                    // Fallback to default values if saving fails
                    addProfileDataToMap(userData, adminProfile);
                }
            }
            
            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage(), e);
            
            // Special case for admin to ensure we always return something
            if ("admin".equals(username)) {
                log.info("Returning default admin data due to error");
                Map<String, Object> adminData = createDefaultAdminData();
                return ResponseEntity.ok(adminData);
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error getting user information.");
        }
    }
    
    // Helper method to add profile data to the response map
    private void addProfileDataToMap(Map<String, Object> userData, UserProfile profile) {
        userData.put("name", profile.getName());
        userData.put("email", profile.getEmail());
        userData.put("phone", profile.getPhone());
        userData.put("position", profile.getPosition());
        userData.put("department", profile.getDepartment());
        userData.put("status", profile.getStatus());
        userData.put("address", profile.getAddress());
        userData.put("hireDate", profile.getHireDate());
        userData.put("employeeId", profile.getEmployeeId());
    }
    
    // Helper method to create a default admin data response
    private Map<String, Object> createDefaultAdminData() {
        Map<String, Object> adminData = new HashMap<>();
        adminData.put("username", "admin");
        adminData.put("roles", List.of("ROLE_ADMIN"));
        adminData.put("name", "System Administrator");
        adminData.put("email", "admin@system.com");
        adminData.put("phone", "123-456-7890");
        adminData.put("position", "System Administrator");
        adminData.put("department", "IT");
        adminData.put("status", "Active");
        adminData.put("address", "Main Office");
        adminData.put("hireDate", new Date());
        adminData.put("employeeId", 1000);
        return adminData;
    }

    // Simple response wrapper for the token
    // public record AuthResponse(String token) {}
    // Using Map<String, String> instead for flexibility
}