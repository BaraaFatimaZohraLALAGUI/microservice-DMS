package com.example.auth_service.service;

import com.example.auth_service.model.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder; // Import PasswordEncoder
import org.springframework.stereotype.Service;

import java.util.ArrayList; // Use ArrayList for mutable list
import java.util.Collections; // For Collections.singletonList
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap; // Use ConcurrentHashMap for thread safety
import java.util.stream.Collectors;

@Service
// Implement UserDetailsService
public class UserService implements UserDetailsService {
    // Use ConcurrentHashMap for thread safety if multiple requests might modify it
    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder

    // Constructor injection for PasswordEncoder
    public UserService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        // Remove hardcoded users - they will be added via signup
    }

    // Method to register a new user
    public User registerUser(String username, String rawPassword, List<String> roles) {
        if (users.containsKey(username)) {
            throw new RuntimeException("Username already exists: " + username); // Consider a custom exception
        }
        String encodedPassword = passwordEncoder.encode(rawPassword);
        // Ensure roles start with ROLE_ prefix if needed by security config, or adjust logic here/there
        // Use a mutable list like ArrayList if roles might be modified later
        User newUser = new User(username, encodedPassword, new ArrayList<>(roles));
        users.put(username, newUser);
        return newUser;
    }

    // Method to update an existing user's password and roles
    public User updateUser(String username, String rawPassword, List<String> roles) {
        User existing = users.get(username);
        if (existing == null) {
            throw new RuntimeException("User not found: " + username);
        }
        // Only update password if a new one is provided
        if (rawPassword != null) {
            String encodedPassword = passwordEncoder.encode(rawPassword);
            existing.setPassword(encodedPassword);
        }
        // Only update roles if new ones are provided and not null
        if (roles != null) {
            existing.setRoles(new ArrayList<>(roles));
        }
        // Make sure roles is never null
        if (existing.getRoles() == null) {
            existing.setRoles(new ArrayList<>());
        }
        users.put(username, existing);
        return existing;
    }

    // Method to delete a user by username
    public void deleteUser(String username) {
        if (!users.containsKey(username)) {
            throw new RuntimeException("User not found: " + username);
        }
        users.remove(username);
    }

    // Method to get all users - required by AdminController
    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }

    // Method to get a user by username - required by AdminController
    public User getUserByUsername(String username) {
        User user = users.get(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }
        return user;
    }

    public User findByUsername(String username) {
        return users.get(username);
    }

    // Implementation of UserDetailsService required by Spring Security
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        // Convert your User model roles to Spring Security GrantedAuthority objects
        List<SimpleGrantedAuthority> authorities = user.getRoles()
                .stream()
                .map(role -> new SimpleGrantedAuthority(role.toString())) // Assuming roles are stored as Strings like "ROLE_USER"
                .collect(Collectors.toList());

        // Return Spring Security's User object which implements UserDetails
        // It needs username, ENCODED password, and authorities
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(), // Password MUST be the encoded one from your User model
                authorities);
    }

    // Remove the old validateCredentials method - Spring Security uses loadUserByUsername + PasswordEncoder
    // public boolean validateCredentials(String username, String password) { ... }
}