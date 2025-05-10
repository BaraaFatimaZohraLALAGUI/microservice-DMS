package com.example.gateway_service.util;

import com.example.gateway_service.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtUtil {

    private final JwtProperties jwtProperties;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Validates the JWT token signature and expiration.
     *
     * @param token The JWT token string.
     * @return true if the token is valid, false otherwise.
     * @throws JwtException if parsing fails (expired, malformed, signature invalid)
     */
    public boolean validateToken(String token) throws JwtException {
         try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token); // This validates signature and expiration
            return true;
        } catch (JwtException e) {
             log.warn("JWT validation failed: {}", e.getMessage());
             // Optionally log specific exception types differently
             // e.g., if (e instanceof ExpiredJwtException) { log.warn(...) }
             throw e; // Re-throw to be caught by the filter
        }
    }

    /**
     * Extracts all claims from a validated token.
     * Note: Call validateToken first or handle exceptions here.
     *
     * @param token The JWT token string.
     * @return The Claims object.
     */
     public Claims extractAllClaims(String token) {
         // This assumes the token is already validated or validation is handled by caller
         return Jwts.parserBuilder()
                 .setSigningKey(getSigningKey())
                 .build()
                 .parseClaimsJws(token)
                 .getBody();
     }

    // Add methods to extract specific claims like username if needed later
    // public String extractUsername(String token) { ... }
}