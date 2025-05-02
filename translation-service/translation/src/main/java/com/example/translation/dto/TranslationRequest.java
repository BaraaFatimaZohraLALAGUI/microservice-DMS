package com.example.translation.dto;

import lombok.Data;

@Data
public class TranslationRequest {
    public TranslationRequest(Long documentId2, String title) {
        this.documentId = documentId2;
        this.text = title;
    }
    private Long documentId;
    private String text;
}