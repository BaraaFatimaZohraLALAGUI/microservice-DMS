package com.example.gateway_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity; // Use reactive ServerHttpSecurity
import org.springframework.security.web.server.SecurityWebFilterChain; // Use reactive SecurityWebFilterChain

@Configuration
@EnableWebFluxSecurity // Enable reactive web security
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            // Disable CSRF - common for stateless APIs/gateways
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            // Disable basic authentication - we handle auth via JWT filter
            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
            // Disable form login - not applicable for gateway
            .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
            // Authorization rules: Since our filter rejects unauthorized calls,
            // requests reaching this point are either permitted (e.g., /auth/login)
            // or have passed JWT validation. We can permit all here.
            .authorizeExchange(exchanges -> exchanges
                 .pathMatchers("/auth/**").permitAll() // Explicitly permit auth paths
                 .pathMatchers("/api/**").permitAll()  // Permit API paths *if* JWT filter passed
                 .anyExchange().permitAll() // Permit actuator or other paths
                 // Alternatively, more strictly: .anyExchange().denyAll() if only /auth and /api are expected
             );
            // If you were adding claims as headers and wanted Spring Security to use them,
            // you would configure authenticationManager/securityContextRepository here.
            // For this simple filter-rejects approach, permitAll is often sufficient.

        return http.build();
    }
}