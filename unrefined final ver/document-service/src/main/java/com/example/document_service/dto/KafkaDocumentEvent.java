package com.example.document_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// DTO representing the event published to Kafka when a document is created
public record KafkaDocumentEvent(
        @NotNull(message = "Document ID cannot be null")
        Long documentId,

        @NotBlank(message = "English title cannot be blank")
        String titleEn
) {}