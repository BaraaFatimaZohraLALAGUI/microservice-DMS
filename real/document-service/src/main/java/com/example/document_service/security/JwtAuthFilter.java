package com.example.document_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    // Read header names from application.yml
    @Value("${gateway.auth.headers.user-id}")
    private String userIdHeader;

    @Value("${gateway.auth.headers.user-roles}")
    private String userRolesHeader;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Extract user info from headers set by the Gateway
        final String userId = request.getHeader(userIdHeader);
        final String rolesHeader = request.getHeader(userRolesHeader); // Renamed for clarity

        if (userId != null && !userId.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.debug("Processing authentication for user ID: {}", userId);

            List<SimpleGrantedAuthority> authorities = Collections.emptyList();
            if (rolesHeader != null && !rolesHeader.isEmpty()) {
                authorities = Arrays.stream(rolesHeader.split(","))
                        .map(String::trim)
                        .filter(role -> !role.isEmpty())
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
                log.debug("User roles: {}", authorities);
            } else {
                 log.warn("No roles found in header '{}' for user ID: {}", userRolesHeader, userId);
            }

            // Create Authentication token - Principal is userId, Credentials null, Authorities parsed
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId, // Use userId as the principal
                    null,   // No credentials needed as Gateway pre-authenticated
                    authorities
            );

            // Set details (optional but good practice)
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set authentication in SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.debug("Authentication set for user ID: {}", userId);

        } else {
             if (userId == null || userId.isEmpty()) {
                 log.trace("No user ID header ('{}') found in request to {}", userIdHeader, request.getRequestURI());
             }
             // If auth is already set, don't override
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}