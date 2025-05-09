package com.example.document_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${app.kafka.topic.document-created}")
    private String documentCreatedTopic;

    @Bean
    public NewTopic documentEventsTopic() {
        // Configure partitions, replicas as needed
        return TopicBuilder.name(documentCreatedTopic)
                .partitions(1) // Start with 1, adjust as needed
                .replicas(1)   // Depends on your Kafka cluster setup
                .build();
    }
}