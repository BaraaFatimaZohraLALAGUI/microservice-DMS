package com.example.document_service.dto;

import lombok.Builder;
import java.time.Instant;

// DTO used for displaying document details to the user
// Includes resolved names for category/department.
@Builder // Use Lombok's Builder for easy construction in the service layer
public record DocumentViewDto(
    Long id,
    String titleEn,
    String titleEs, // Can be null if not translated yet
    String s3FileKey,
    String fileName,
    String fileType,
    Long fileSize,
    String categoryName, // Note: Name, not ID
    String departmentName, // Note: Name, not ID
    String ownerUserId,
    Instant createdAt,
    Instant updatedAt
) {}