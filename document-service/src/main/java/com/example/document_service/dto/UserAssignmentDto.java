package com.example.document_service.dto;

import jakarta.validation.constraints.NotBlank;

// DTO used when assigning a user to a department
public record UserAssignmentDto(
        @NotBlank(message = "User ID cannot be blank")
        String userId
) {}