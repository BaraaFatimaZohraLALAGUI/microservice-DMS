package com.example.document_service.dto;

import jakarta.validation.constraints.NotBlank;

// DTO for receiving the translated title
public record TranslateRequestDto(
        @NotBlank(message = "Translated Spanish title cannot be blank")
        String titleEs
) {}