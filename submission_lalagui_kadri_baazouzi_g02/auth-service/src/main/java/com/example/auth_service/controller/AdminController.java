package com.example.auth_service.controller;

import com.example.auth_service.model.User;
import com.example.auth_service.model.UserProfile;
import com.example.auth_service.service.UserService;
import com.example.auth_service.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final UserProfileService userProfileService;

    // Extended DTO for user creation and update with profile data
    public record UserRequest(
        String username, 
        String password, 
        List<String> roles, 
        // Additional profile fields
        String name,
        String email,
        String phone,
        String position,
        String department,
        String status,
        String address,
        Date hireDate,
        Integer employeeId
    ) {}

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            // Map to response format with enhanced profile data
            List<Map<String, Object>> responseData = users.stream()
                .map(user -> {
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("username", user.getUsername());
                    userData.put("roles", user.getRoles() != null ? user.getRoles() : new ArrayList<>());
                    
                    // Add profile data if exists
                    UserProfile profile = userProfileService.getProfileByUsername(user.getUsername());
                    if (profile != null) {
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
                    
                    return userData;
                })
                .toList();
                
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("username", user.getUsername());
            userData.put("roles", user.getRoles() != null ? user.getRoles() : new ArrayList<>());
            
            // Add profile data if exists
            UserProfile profile = userProfileService.getProfileByUsername(username);
            if (profile != null) {
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
            
            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserRequest req) {
        try {
            // Create the base user
            User user = userService.registerUser(req.username(), req.password(), req.roles());
            
            // Create or update the user profile with additional information
            UserProfile profile = new UserProfile();
            profile.setUsername(user.getUsername());
            profile.setName(req.name());
            profile.setEmail(req.email());
            profile.setPhone(req.phone());
            profile.setPosition(req.position());
            profile.setDepartment(req.department());
            profile.setStatus(req.status());
            profile.setAddress(req.address());
            profile.setHireDate(req.hireDate());
            profile.setEmployeeId(req.employeeId());
            
            userProfileService.saveProfile(profile);
            
            // Create response with combined data
            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("roles", user.getRoles() != null ? user.getRoles() : new ArrayList<>());
            response.put("name", profile.getName());
            response.put("email", profile.getEmail());
            response.put("phone", profile.getPhone());
            response.put("position", profile.getPosition());
            response.put("department", profile.getDepartment());
            response.put("status", profile.getStatus());
            response.put("address", profile.getAddress());
            response.put("hireDate", profile.getHireDate());
            response.put("employeeId", profile.getEmployeeId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody Map<String, Object> requestMap) {
        try {
            // Extract fields from the request map to handle missing fields gracefully
            String password = requestMap.get("password") != null ? (String) requestMap.get("password") : null;
            
            // Handle the case when roles are null by keeping the existing roles
            List<String> roles = null;
            if (requestMap.get("roles") != null) {
                try {
                    @SuppressWarnings("unchecked")
                    List<String> extractedRoles = (List<String>) requestMap.get("roles");
                    roles = extractedRoles != null ? new ArrayList<>(extractedRoles) : null;
                } catch (ClassCastException e) {
                    System.out.println("Error parsing roles: " + e.getMessage());
                    // Keep roles as null to maintain existing roles
                }
            }
            
            // Update the base user only if password or roles are provided
            User user = userService.getUserByUsername(username);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Update user, now our service can handle null password and roles
            user = userService.updateUser(username, password, roles);
            
            // Ensure user roles is never null to avoid NPE
            if (user.getRoles() == null) {
                user.setRoles(new ArrayList<>());
            }
            
            // Update the profile information
            UserProfile profile = userProfileService.getProfileByUsername(username);
            if (profile == null) {
                profile = new UserProfile();
                profile.setUsername(username);
            }
            
            // Update profile fields only if they are provided in the request
            if (requestMap.get("name") != null) profile.setName((String) requestMap.get("name"));
            if (requestMap.get("email") != null) profile.setEmail((String) requestMap.get("email"));
            if (requestMap.get("phone") != null) profile.setPhone((String) requestMap.get("phone"));
            if (requestMap.get("position") != null) profile.setPosition((String) requestMap.get("position"));
            if (requestMap.get("department") != null) profile.setDepartment((String) requestMap.get("department"));
            if (requestMap.get("status") != null) profile.setStatus((String) requestMap.get("status"));
            if (requestMap.get("address") != null) profile.setAddress((String) requestMap.get("address"));
            
            // Handle Date object conversion carefully
            if (requestMap.get("hireDate") != null) {
                try {
                    // Try to parse date from string if it's a string
                    if (requestMap.get("hireDate") instanceof String) {
                        profile.setHireDate(new Date(((String) requestMap.get("hireDate"))));
                    } else {
                        // If it's already a date object in JSON format
                        profile.setHireDate(new Date((Long) requestMap.get("hireDate")));
                    }
                } catch (Exception e) {
                    // Log but continue with other fields
                    System.out.println("Error parsing hire date: " + e.getMessage());
                }
            }
            
            if (requestMap.get("employeeId") != null) {
                try {
                    if (requestMap.get("employeeId") instanceof Integer) {
                        profile.setEmployeeId((Integer) requestMap.get("employeeId"));
                    } else if (requestMap.get("employeeId") instanceof Number) {
                        profile.setEmployeeId(((Number) requestMap.get("employeeId")).intValue());
                    } else {
                        profile.setEmployeeId(Integer.parseInt(requestMap.get("employeeId").toString()));
                    }
                } catch (Exception e) {
                    System.out.println("Error parsing employee ID: " + e.getMessage());
                }
            }
            
            userProfileService.saveProfile(profile);
            
            // Create response with combined data
            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("roles", user.getRoles() != null ? new ArrayList<>(user.getRoles()) : new ArrayList<>());
            response.put("name", profile.getName());
            response.put("email", profile.getEmail());
            response.put("phone", profile.getPhone());
            response.put("position", profile.getPosition());
            response.put("department", profile.getDepartment());
            response.put("status", profile.getStatus());
            response.put("address", profile.getAddress());
            response.put("hireDate", profile.getHireDate());
            response.put("employeeId", profile.getEmployeeId());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            e.printStackTrace(); // Log the full stack trace
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        try {
            // Delete profile first
            userProfileService.deleteProfile(username);
            
            // Then delete user
            userService.deleteUser(username);
            
            return ResponseEntity.ok(Map.of("deleted", username));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
