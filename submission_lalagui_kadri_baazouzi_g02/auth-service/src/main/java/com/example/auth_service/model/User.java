package com.example.auth_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private String username;
    private String password; // This will store the ENCODED password
    private List<String> roles = new ArrayList<>(); // Initialize to avoid nulls
}