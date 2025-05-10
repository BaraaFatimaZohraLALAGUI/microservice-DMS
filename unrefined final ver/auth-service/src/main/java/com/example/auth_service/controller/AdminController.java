package com.example.auth_service.controller;

import com.example.auth_service.model.User;
import com.example.auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;

    // DTO for user creation and update
    public record UserRequest(String username, String password, List<String> roles) {}

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserRequest req) {
        try {
            User user = userService.registerUser(req.username(), req.password(), req.roles());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "username", user.getUsername(),
                "roles", user.getRoles()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody UserRequest req) {
        try {
            User user = userService.updateUser(username, req.password(), req.roles());
            return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "roles", user.getRoles()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        try {
            userService.deleteUser(username);
            return ResponseEntity.ok(Map.of("deleted", username));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
