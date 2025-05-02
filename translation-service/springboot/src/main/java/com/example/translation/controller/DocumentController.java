package com.example.translation.controller;

import com.example.translation.dto.DocumentDto;
import com.example.translation.model.Document;
import com.example.translation.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;
    
    @PostMapping
    public ResponseEntity<Document> createDocument(@RequestBody DocumentDto documentDto) {
        return ResponseEntity.ok(documentService.createDocument(documentDto));
    }
}