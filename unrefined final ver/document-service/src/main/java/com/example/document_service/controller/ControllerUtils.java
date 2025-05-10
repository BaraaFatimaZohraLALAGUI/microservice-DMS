package com.example.document_service.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ControllerUtils {

    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
         // The principal is set to the user ID string in JwtAuthFilter
        Object principal = authentication.getPrincipal();
         if (principal instanceof String) {
             return (String) principal;
         }
        // Fallback or different principal type handling if needed
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