package com.example.document_service.service;

import com.example.document_service.dto.KafkaDocumentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, KafkaDocumentEvent> kafkaTemplate;

    @Value("${app.kafka.topic.document-created}")
    private String topicName;

    public void sendDocumentCreatedEvent(Long documentId, String titleEn) {
        KafkaDocumentEvent event = new KafkaDocumentEvent(documentId, titleEn);
        try {
            // Send message (key can be documentId as string or null)
            kafkaTemplate.send(topicName, String.valueOf(documentId), event);
            log.info("Sent document created event to Kafka topic '{}': {}", topicName, event);
        } catch (Exception e) {
            log.error("Failed to send document created event for document ID {} to Kafka: {}", documentId, e.getMessage());
            // Consider adding retry logic or dead-letter queue mechanism here
        }
    }
}