package com.example.translation.service;

import com.example.translation.dto.DocumentDto;
import com.example.translation.model.Document;
import com.example.translation.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final TranslationService translationService;
    
    @Transactional
    public Document createDocument(DocumentDto documentDto) {
        Document document = new Document();
        document.setTitle(documentDto.getTitle());
        document.setCategory(documentDto.getCategory());
        document.setDepartment(documentDto.getDepartment());
        document.setFileContent(documentDto.getFileContent());
        
        Document savedDocument = documentRepository.save(document);
        
        // Request translation
        translationService.requestTranslation(savedDocument.getId(), documentDto.getTitle());
        
        return savedDocument;
    }
    
    @Transactional
    public void updateTranslatedTitle(Long documentId, String translatedTitle) {
        documentRepository.findById(documentId).ifPresent(document -> {
            document.setTranslatedTitle(translatedTitle);
            documentRepository.save(document);
        });
    }
}