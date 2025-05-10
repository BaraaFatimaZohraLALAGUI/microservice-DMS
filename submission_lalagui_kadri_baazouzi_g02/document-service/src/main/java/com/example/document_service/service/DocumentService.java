package com.example.document_service.service;

import com.example.document_service.dto.DocumentCreateRequestDto;
import com.example.document_service.dto.DocumentViewDto;
// Removed unused DTO imports: CategoryDto, DepartmentDto, UserDepartmentDto
import com.example.document_service.exception.ResourceNotFoundException;
import com.example.document_service.model.Category;
import com.example.document_service.model.Department;
import com.example.document_service.model.Document;
import com.example.document_service.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
// Removed unused import: java.util.Set
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CategoryService categoryService; // Use service to get Category entity
    private final DepartmentService departmentService; // Use service to get Department entity
    private final UserDepartmentService userDepartmentService;
    private final KafkaProducerService kafkaProducerService;

    @Transactional
    public DocumentViewDto createDocument(DocumentCreateRequestDto dto, String ownerUserId) {
        // FIX: Use the 'dto' instance to access its fields, not the class name
        // statically
        log.info("Creating document '{}' for user {}", dto.titleEn(), ownerUserId);

        // FIX: Use the categoryId and departmentId from the incoming 'dto' instance
        Category category = categoryService.findCategoryById(dto.categoryId());
        Department department = departmentService.findDepartmentById(dto.departmentId());

        // Create and populate the Document entity
        Document document = new Document();
        document.setTitleEn(dto.titleEn());
        document.setCategory(category);
        document.setDepartment(department);
        document.setOwnerUserId(ownerUserId);
        document.setS3FileKey(dto.s3FileKey());
        document.setFileName(dto.fileName());
        document.setFileType(dto.fileType());
        document.setFileSize(dto.fileSize());
        // titleEs will be set later by the translation service

        // Save the document
        Document savedDocument = documentRepository.save(document);
        log.info("Document saved with ID: {}", savedDocument.getId());

        // Send event to Kafka
        kafkaProducerService.sendDocumentCreatedEvent(savedDocument.getId(), savedDocument.getTitleEn());

        // Map to DTO and return
        return mapToViewDto(savedDocument);
    }

    @Transactional(readOnly = true)
    public DocumentViewDto getDocumentById(Long id, String userId, List<String> userRoles) {
        log.debug("Fetching document by ID: {} for user: {}", id, userId);
        Document document = documentRepository.findByIdWithDetails(id) // Use query with JOIN FETCH
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        // Authorization check: Admin can see everything, User can only see docs in
        // their departments
        if (!userRoles.contains("ROLE_ADMIN")) {
            List<Long> accessibleDepartmentIds = userDepartmentService.getUserDepartmentIds(userId);
            if (!accessibleDepartmentIds.contains(document.getDepartment().getId())) {
                log.warn("Access denied for user {} to document {} in department {}",
                        userId, id, document.getDepartment().getId());
                throw new AccessDeniedException("User does not have access to this document's department");
            }
        }

        return mapToViewDto(document);
    }

    @Transactional(readOnly = true)
    public Page<DocumentViewDto> findDocumentsForUser(String userId, Pageable pageable) {
        log.debug("Finding documents for user {} with page request {}", userId, pageable);
        List<Long> departmentIds = userDepartmentService.getUserDepartmentIds(userId);

        if (departmentIds.isEmpty()) {
            log.debug("User {} is not assigned to any departments.", userId);
            return Page.empty(pageable); // Return empty page if user has no departments
        }

        Page<Document> documentPage = documentRepository.findByDepartmentIdIn(departmentIds, pageable);
        log.debug("Found {} documents for user {} in departments {}", documentPage.getTotalElements(), userId,
                departmentIds);

        return documentPage.map(this::mapToViewDto);
    }

    // Method for Admin to see all documents (optional)
    @Transactional(readOnly = true)
    public Page<DocumentViewDto> findAllDocuments(Pageable pageable) {
        log.debug("Finding all documents with page request {}", pageable);
        // Ensure your repository method `findAllWithDetails` exists and is correct
        Page<Document> documentPage = documentRepository.findAllWithDetails(pageable);
        return documentPage.map(this::mapToViewDto);
    }

    @Transactional
    public DocumentViewDto updateTranslatedTitle(Long documentId, String titleEs) {
        log.info("Updating translated title for document ID: {}", documentId);
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        document.setTitleEs(titleEs);
        Document updatedDocument = documentRepository.save(document);
        log.info("Successfully updated Spanish title for document ID: {}", documentId);

        return mapToViewDto(updatedDocument);
    }

    // --- Admin Only Methods (Example: Delete) ---
    @Transactional
    public void deleteDocument(Long id) {
        log.warn("Attempting to delete document with ID: {}", id);
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        // Consider triggering S3 deletion event here if needed
        // kafkaProducerService.sendDocumentDeletedEvent(document.getS3FileKey()); //
        // Example

        documentRepository.delete(document);
        log.warn("Deleted document metadata for ID: {}", id);
    }

    // --- Helper Method ---
    private DocumentViewDto mapToViewDto(Document document) {
        // Handles potential nulls if category/department weren't fetched properly
        // (shouldn't happen with JOIN FETCH)
        String categoryName = (document.getCategory() != null) ? document.getCategory().getName() : null;
        String departmentName = (document.getDepartment() != null) ? document.getDepartment().getName() : null;

        // Ensure DocumentViewDto has a builder method or a constructor matching these
        // fields
        return DocumentViewDto.builder()
                .id(document.getId())
                .titleEn(document.getTitleEn())
                .titleEs(document.getTitleEs())
                .s3FileKey(document.getS3FileKey())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .fileSize(document.getFileSize())
                .categoryName(categoryName)
                .departmentName(departmentName)
                .ownerUserId(document.getOwnerUserId())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}