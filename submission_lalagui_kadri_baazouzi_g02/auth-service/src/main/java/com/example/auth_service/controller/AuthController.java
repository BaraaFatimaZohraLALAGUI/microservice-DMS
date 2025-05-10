package com.example.auth_service.controller;

import com.example.auth_service.config.JwtUtil;
import com.example.auth_service.model.User; // Import your User model
import com.example.auth_service.service.UserService; // Import UserService

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

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserService userService; // Inject UserService

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

    // Simple response wrapper for the token
    // public record AuthResponse(String token) {}
    // Using Map<String, String> instead for flexibility
}