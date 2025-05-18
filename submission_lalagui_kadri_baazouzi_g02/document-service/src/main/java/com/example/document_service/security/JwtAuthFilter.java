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
import java.util.Enumeration;
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
        final String rolesHeader = request.getHeader(userRolesHeader);

        // Log all headers for debugging
        if (log.isDebugEnabled()) {
            log.debug("Request URI: {}", request.getRequestURI());
            log.debug("Request Method: {}", request.getMethod());
            Enumeration<String> headerNames = request.getHeaderNames();
            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    log.debug("Header: '{}' = '{}'", headerName, request.getHeader(headerName));
                }
            }
            log.debug("User ID Header '{}': '{}'", userIdHeader, userId);
            log.debug("User Roles Header '{}': '{}'", userRolesHeader, rolesHeader);
        }

        // If userId is null or empty, we'll set an anonymous auth to avoid "anonymousUser" in logs
        if (userId == null || userId.isEmpty()) {
            // Only set if authentication is not already set
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("No user ID found in header '{}'. Using default authentication.", userIdHeader);
                
                // Set authentication with a known user identity (not "anonymousUser")
                // This helps track authorization failures more clearly
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        "unauthenticated-user", null, Collections.emptyList());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } else if (SecurityContextHolder.getContext().getAuthentication() == null) {
            // Process normal authentication when user ID is present
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

            // Create Authentication token with userId as the principal
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId, null, authorities);
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            
            // Set authentication in SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.debug("Authentication set for user ID: {}", userId);
        } else {
            log.debug("Authentication already exists: {}", 
                SecurityContextHolder.getContext().getAuthentication());
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}