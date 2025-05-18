package com.example.gateway_service.filter;

import com.example.gateway_service.config.JwtProperties;
import com.example.gateway_service.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono; // Import Mono

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    
    @Value("${app.auth.header.names.user-id}")
    private String userIdHeaderName;
    
    @Value("${app.auth.header.names.user-roles}")
    private String userRolesHeaderName;

    // Define paths that should bypass JWT validation
    private final List<String> excludedPaths = List.of(
            "/auth/login",
            "/auth/token", // Add other paths like registration if needed
            "/auth/signup"
            // Add actuator paths if exposed and should be public
            // "/actuator", "/actuator/health"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Check if the path is excluded from validation
        boolean isExcluded = excludedPaths.stream().anyMatch(p -> path.startsWith(p));
        if (isExcluded) {
            log.debug("Path {} is excluded from JWT validation. Passing through.", path);
            return chain.filter(exchange); // Pass request without validation
        }

        log.debug("Path {} requires JWT validation.", path);

        // 2. Get the Authorization header
        String authHeader = request.getHeaders().getFirst(jwtProperties.getHeaderName());

        // 3. Validate Header and Token Prefix
        if (authHeader == null || !authHeader.startsWith(jwtProperties.getTokenPrefix())) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            return handleUnauthorized(exchange, "Missing or invalid Authorization header");
        }

        // 4. Extract Token
        String token = authHeader.substring(jwtProperties.getTokenPrefix().length());

        // 5. Validate Token using JwtUtil
        try {
            if (jwtUtil.validateToken(token)) {
                log.debug("JWT validation successful for path: {}", path);
                
                // Extract claims and add as headers to downstream request
                Claims claims = jwtUtil.extractAllClaims(token);
                String username = claims.getSubject();
                String roles = claims.get("roles", List.class).toString();
                
                log.debug("Adding user headers - Username: {}, Roles: {}", username, roles);
                
                // Create a new request with the additional headers
                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header(userIdHeaderName, username)
                    .header(userRolesHeaderName, roles.replace("[", "").replace("]", "").replace(" ", ""))
                    .build();
                
                // Pass the mutated request to the next filter
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            } else {
                // This case might not be strictly necessary if validateToken throws exceptions
                log.error("JWT validation returned false unexpectedly for path: {}", path);
                return handleUnauthorized(exchange, "Invalid JWT Token");
            }
        } catch (JwtException e) {
            // Catch exceptions from jwtUtil.validateToken (expired, signature, malformed)
            log.error("JWT validation failed for path {}: {}", path, e.getMessage());
            return handleUnauthorized(exchange, "JWT validation failed: " + e.getMessage());
        } catch (Exception e) {
             // Catch any other unexpected errors during validation
             log.error("Unexpected error during JWT filter execution for path {}: {}", path, e.getMessage(), e);
             return handleServerError(exchange, "Internal error during token validation");
        }
    }

    // Helper to set 401 Unauthorized response
    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json"); // Optional: set content type
         // Optional: Write a simple JSON error message to the response body
         // byte[] bytes = ("{\"error\": \"Unauthorized\", \"message\": \"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
         // DataBuffer buffer = response.bufferFactory().wrap(bytes);
         // return response.writeWith(Mono.just(buffer));
        return response.setComplete(); // Simpler: just set status and complete
    }

     // Helper to set 500 Internal Server Error response
    private Mono<Void> handleServerError(ServerWebExchange exchange, String message) {
         ServerHttpResponse response = exchange.getResponse();
         response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
         response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
         // byte[] bytes = ("{\"error\": \"Internal Server Error\", \"message\": \"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
         // DataBuffer buffer = response.bufferFactory().wrap(bytes);
         // return response.writeWith(Mono.just(buffer));
         return response.setComplete();
    }


    @Override
    public int getOrder() {
        // Run before standard security filters if they were active,
        // or simply a high priority. Lower values run first.
        return -100; // Example: Ensure it runs early
    }
}