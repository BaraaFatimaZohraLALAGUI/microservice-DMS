package com.example.document_service.dto;

import jakarta.validation.constraints.NotBlank;

// DTO for Department data transfer
public record DepartmentDto(
    Long id, // Nullable for creation requests

    @NotBlank(message = "Department name cannot be blank")
    String name
) {}