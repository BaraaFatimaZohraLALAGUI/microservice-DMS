package com.example.document_service.dto;

import jakarta.validation.constraints.NotBlank;

// DTO for Category data transfer
public record CategoryDto(
    Long id, // Nullable for creation requests

    @NotBlank(message = "Category name cannot be blank")
    String name
) {}