package com.example.document_service.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class ControllerUtils {

    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("User is not authenticated");
            throw new IllegalStateException("User is not authenticated");
        }
        
        // The principal is set to the user ID string in JwtAuthFilter
        Object principal = authentication.getPrincipal();
        if (principal instanceof String) {
            String userId = (String) principal;
            
            // Check for placeholder user IDs
            if ("anonymousUser".equals(userId) || "unauthenticated-user".equals(userId)) {
                log.warn("User is using a placeholder identity: {}", userId);
                throw new IllegalStateException("Valid user ID is required");
            }
            
            return userId;
        }
        
        // If we get here, log the actual type for debugging
        log.error("Unexpected principal type: {}", 
                 principal != null ? principal.getClass().getName() : "null");
        throw new IllegalStateException("Authenticated principal is not the expected type (String user ID)");
    }

    public List<String> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return List.of();
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }
}