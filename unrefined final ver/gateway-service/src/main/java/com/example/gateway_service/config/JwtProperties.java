package com.example.gateway_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtProperties {
    private String secret;
    // Defaults can be added here if needed, matching header/prefix used in filter
    private String headerName = "Authorization";
    private String tokenPrefix = "Bearer ";
}