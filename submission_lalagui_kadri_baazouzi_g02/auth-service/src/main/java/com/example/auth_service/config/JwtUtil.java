package com.example.auth_service.config;

// Keep this import only if generateToken(User user) method is kept and used
import com.example.auth_service.model.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j; // Add logging

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map; // Import Map

@Component
@Slf4j // Add logging
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expirationMs}")
    private int expirationMs;

    private Key getSigningKey() {
        // Consider logging a warning if the key is too short for the algorithm
        byte[] keyBytes = this.secret.getBytes();
        // HS512 ideally needs a 512-bit (64 byte) key. Keys.hmacShaKeyFor handles varying lengths.
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a token from a custom User object.
     * Keep this method if your UserDetailsService might return your custom User type,
     * or if you use it elsewhere. Ensure User model has getUsername() and getRoles()
     * returning appropriate types (String and Collection<String> respectively).
     */
    public String generateToken(User user) {
        log.debug("Generating token for custom User object: {}", user.getUsername());
        Map<String, Object> claims = new HashMap<>();
        // Make sure user.getRoles() returns a Collection<String> (like ["ADMIN", "USER"])
        claims.put("roles", user.getRoles());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + this.expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512) // Ensure consistent Algorithm
                .compact();
    }

    /**
     * Generates a token directly from username and a pre-built claims map.
     * Suitable for use with Spring Security's standard UserDetails.
     *
     * @param username The username (will be set as JWT subject).
     * @param claims   A Map containing claims to include (e.g., "roles" -> List<String>).
     * @return The generated JWT string.
     */
    public String generateTokenFromDetails(String username, Map<String, Object> claims) {
         log.debug("Generating token for username '{}' with claims: {}", username, claims);
        // The claims map should already contain the 'roles' claim prepared by the caller.
        return Jwts.builder()
                .setClaims(claims) // Set the provided claims map
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + this.expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512) // Ensure consistent Algorithm
                .compact();
    }
}