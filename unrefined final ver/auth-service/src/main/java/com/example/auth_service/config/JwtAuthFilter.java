package com.example.auth_service.config;

// import com.example.auth_service.model.User;
import com.example.auth_service.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final UserService userService;
    @Value("${jwt.secret}")
    private String secret;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secret.getBytes())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
                username = claims.getSubject();
                @SuppressWarnings("unchecked")
                List<String> roles = (List<String>) claims.get("roles", List.class);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userService.loadUserByUsername(username);
                    // Check roles from token match userDetails (optional, for extra security)
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null,
                            roles.stream().map(org.springframework.security.core.authority.SimpleGrantedAuthority::new).collect(Collectors.toList())
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception ignored) {
                // Invalid token, do nothing (request will be rejected by security if needed)
            }
        }
        filterChain.doFilter(request, response);
    }
}
