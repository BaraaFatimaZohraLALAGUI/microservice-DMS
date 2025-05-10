package com.example.document_service.controller;

import com.example.document_service.dto.DocumentCreateRequestDto;
import com.example.document_service.dto.DocumentViewDto;
import com.example.document_service.dto.TranslateRequestDto;
import com.example.document_service.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final ControllerUtils controllerUtils; // Helper for user context

    @PostMapping
    @PreAuthorize("hasRole('USER')") // Only users can create documents
    public ResponseEntity<DocumentViewDto> createDocument(@Valid @RequestBody DocumentCreateRequestDto createRequestDto) {
        String currentUserId = controllerUtils.getCurrentUserId();
        DocumentViewDto createdDocument = documentService.createDocument(createRequestDto, currentUserId);
        return new ResponseEntity<>(createdDocument, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')") // Users or Admins can view specific documents
    public ResponseEntity<DocumentViewDto> getDocumentById(@PathVariable Long id) {
        String currentUserId = controllerUtils.getCurrentUserId();
        var currentUserRoles = controllerUtils.getCurrentUserRoles();
        DocumentViewDto document = documentService.getDocumentById(id, currentUserId, currentUserRoles);
        return ResponseEntity.ok(document);
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')") // Users see documents based on their departments
    public ResponseEntity<Page<DocumentViewDto>> getMyDocuments(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
         String currentUserId = controllerUtils.getCurrentUserId();
        Page<DocumentViewDto> documents = documentService.findDocumentsForUser(currentUserId, pageable);
        return ResponseEntity.ok(documents);
    }

    // Optional: Endpoint for Admin to see all documents
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DocumentViewDto>> getAllDocuments(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<DocumentViewDto> documents = documentService.findAllDocuments(pageable);
        return ResponseEntity.ok(documents);
    }


    @PatchMapping("/{id}/translate")
    // This endpoint is called internally by the Translation Service.
    // Secure it appropriately (e.g., require an API key, internal network access, or a specific service role if using mutual auth)
    // For simplicity here, we allow unauthenticated access, but **THIS IS NOT PRODUCTION READY**.
    // @PreAuthorize("hasRole('SERVICE_TRANSLATOR')") // Example if using service roles
    public ResponseEntity<DocumentViewDto> updateTranslatedTitle(@PathVariable Long id, @Valid @RequestBody TranslateRequestDto translateDto) {
        DocumentViewDto updatedDocument = documentService.updateTranslatedTitle(id, translateDto.titleEs());
        return ResponseEntity.ok(updatedDocument);
    }

    // --- Admin Operations ---

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    // Add PUT endpoint for admin editing if needed
    // @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    // public ResponseEntity<DocumentViewDto> updateDocument(@PathVariable Long id, @Valid @RequestBody DocumentUpdateRequestDto updateDto) { ... }

}