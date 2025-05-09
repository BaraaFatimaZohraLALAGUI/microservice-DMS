package com.example.translation.service;

import com.example.translation.dto.TranslationRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranslationService {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final DocumentService documentService;
    private final ObjectMapper objectMapper;
    
    public void requestTranslation(Long documentId, String title) {
        try {
            String message = objectMapper.writeValueAsString(
                new TranslationRequest(documentId, title)
            );
            kafkaTemplate.send("translation-requests", documentId.toString(), message);
            log.info("Sent translation request for document ID: {}", documentId);
        } catch (JsonProcessingException e) {
            log.error("Error serializing translation request", e);
        }
    }
    
    @KafkaListener(topics = "translation-results", groupId = "translation-group")
    public void handleTranslationResult(String message) {
        try {
            TranslationRequest result = objectMapper.readValue(message, TranslationRequest.class);
            log.info("Received translation result for document ID: {}", result.getDocumentId());
            documentService.updateTranslatedTitle(result.getDocumentId(), result.getText());
        } catch (JsonProcessingException e) {
            log.error("Error processing translation result", e);
        }
    }
}