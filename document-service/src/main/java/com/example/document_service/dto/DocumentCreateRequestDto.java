package com.example.document_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

// DTO used when creating a new document's metadata record
// The actual file upload happens separately via the Storage Service.
public record DocumentCreateRequestDto(
    @NotBlank(message = "English title cannot be blank")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    String titleEn,

    @NotNull(message = "Category ID cannot be null")
    @Positive(message = "Category ID must be a positive number")
    Long categoryId,

    @NotNull(message = "Department ID cannot be null")
    @Positive(message = "Department ID must be a positive number")
    Long departmentId,

    @NotBlank(message = "S3 file key cannot be blank")
    String s3FileKey, // Provided by the Storage Service after upload

    @NotBlank(message = "File name cannot be blank")
    String fileName,  // Original file name

    String fileType, // Optional but recommended (e.g., "application/pdf")

    @Positive(message = "File size must be positive")
    Long fileSize   // Optional but recommended
) {}