package com.example.auth_service.config;

import com.example.auth_service.service.UserService; // Import UserService
import com.example.auth_service.config.JwtAuthFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order; // Import Order
import org.springframework.http.HttpMethod; // Import HttpMethod
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder; // Import AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;


@Configuration
@EnableWebSecurity
public class SecurityConfig {


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configure AuthenticationManager to use UserService and PasswordEncoder
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, UserService userService, PasswordEncoder passwordEncoder) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(userService)
                                     .passwordEncoder(passwordEncoder);
        return authenticationManagerBuilder.build();
    }


    // Add a chain specifically for signup
    @Bean
    @Order(1) // Lower number means higher priority
    public SecurityFilterChain signupFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(new AntPathRequestMatcher("/auth/signup", "POST"))
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Permit POST requests to /auth/signup for everyone
                .requestMatchers(HttpMethod.POST, "/auth/signup").permitAll()
            );
            // No authentication needed for signup itself
        return http.build();
    }


    @Bean
    @Order(2) // Higher number means lower priority - handles everything else
    public SecurityFilterChain defaultFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
         http
             // Apply this chain to any request NOT matched by signupFilterChain
             .csrf(AbstractHttpConfigurer::disable)
             .cors(AbstractHttpConfigurer::disable)
             .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
             .authorizeHttpRequests(auth -> auth
                 // Secure everything else
                 .anyRequest().authenticated()
             )
             // Apply Basic Auth to this chain (used for /auth/token)
             .httpBasic(Customizer.withDefaults());

         // Add JWT filter before UsernamePasswordAuthenticationFilter
         http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

         return http.build();
    }

}