package com.example.document_service.controller;

import com.example.document_service.dto.DocumentCreateRequestDto;
import com.example.document_service.dto.DocumentViewDto;
import com.example.document_service.dto.TranslateRequestDto;
import com.example.document_service.service.DocumentService;
import com.example.document_service.service.UserDepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;
    private final ControllerUtils controllerUtils; // Helper for user context
    private final UserDepartmentService userDepartmentService;

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

    // Add an endpoint to get documents by specific department (only if user has access to it)
    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasRole('USER')") 
    public ResponseEntity<Page<DocumentViewDto>> getDocumentsByDepartment(
            @PathVariable Long departmentId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        
        String currentUserId = controllerUtils.getCurrentUserId();
        var currentUserRoles = controllerUtils.getCurrentUserRoles();
        
        // Check if user has access to the department (admin can access all)
        if (!currentUserRoles.contains("ROLE_ADMIN")) {
            List<Long> userDepartmentIds = userDepartmentService.getUserDepartmentIds(currentUserId);
            
            if (!userDepartmentIds.contains(departmentId)) {
                log.warn("User {} attempted to access documents in department {} they don't have access to", 
                    currentUserId, departmentId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        Page<DocumentViewDto> documents = documentService.findDocumentsByDepartment(departmentId, pageable);
        return ResponseEntity.ok(documents);
    }

    // Optional: Endpoint for Admin to see all documents
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DocumentViewDto>> getAllDocuments(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<DocumentViewDto> documents = documentService.findAllDocuments(pageable);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> getDocumentDownloadUrl(@PathVariable Long id) {
        String currentUserId = controllerUtils.getCurrentUserId();
        var currentUserRoles = controllerUtils.getCurrentUserRoles();
        
        log.info("User {} is requesting download for document {}", currentUserId, id);
        
        // First check if the user has access to the document
        DocumentViewDto document = documentService.getDocumentById(id, currentUserId, currentUserRoles);
        
        // If the document exists and user has access, return the S3 file key
        Map<String, String> response = new HashMap<>();
        response.put("s3FileKey", document.s3FileKey());
        response.put("fileName", document.fileName());
        
        // Also include a direct link to the storage proxy endpoint
        String storageProxyUrl = "/api/storage/presigned-url/" + document.s3FileKey();
        response.put("downloadUrl", storageProxyUrl);
        
        log.info("Providing download information for document {} to user {}", id, currentUserId);
        return ResponseEntity.ok(response);
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