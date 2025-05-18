package com.example.document_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Proxy controller to handle storage service operations for document downloads.
 * This avoids CORS issues and provides a simplified API for the frontend.
 */
@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
@Slf4j
public class StorageProxyController {

    private final ControllerUtils controllerUtils;
    private final RestTemplate restTemplate;
    
    @Value("${storage.service.url:http://storage-service:8002}")
    private String storageServiceUrl;

    /**
     * Get a presigned URL for downloading a document
     * 
     * @param s3FileKey The S3 file key to download
     * @return A response containing the presigned URL
     */
    @GetMapping("/presigned-url/{s3FileKey:.+}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> getPresignedUrl(@PathVariable String s3FileKey) {
        try {
            // Get the current user (for audit purposes)
            String currentUserId = controllerUtils.getCurrentUserId();
            log.info("User {} is requesting presigned URL for file: {}", currentUserId, s3FileKey);
            
            // Encode the s3FileKey to handle special characters in the path
            String encodedS3FileKey = URLEncoder.encode(s3FileKey, StandardCharsets.UTF_8.toString());
            
            // Forward the request to the storage service
            String storageServiceEndpoint = storageServiceUrl + "/presigned-url/" + encodedS3FileKey;
            log.debug("Forwarding request to storage service: {}", storageServiceEndpoint);
            
            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(
                    storageServiceEndpoint, 
                    Map.class);
            
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                log.info("Successfully retrieved presigned URL for file: {}", s3FileKey);
                
                // Extract the URL from the response
                String url = (String) responseEntity.getBody().get("url");
                
                // Return a simplified response
                Map<String, String> response = new HashMap<>();
                response.put("url", url);
                return ResponseEntity.ok(response);
            } else {
                log.error("Error retrieving presigned URL from storage service: {}", responseEntity.getStatusCode());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to retrieve download URL"));
            }
        } catch (Exception e) {
            log.error("Error generating presigned URL for file: {}", s3FileKey, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate download URL: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Upload a file to the storage service
     * 
     * @param file The file to upload
     * @return A response containing the uploaded file's S3 key
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Get the current user (for audit purposes)
            String currentUserId = controllerUtils.getCurrentUserId();
            log.info("User {} is uploading file: {}, size: {}", currentUserId, file.getOriginalFilename(), file.getSize());
            
            // Forward the request to the storage service
            String storageServiceEndpoint = storageServiceUrl + "/upload/";
            log.debug("Forwarding upload request to storage service: {}", storageServiceEndpoint);
            
            // Create multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", fileResource);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // Send the request to the storage service
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    storageServiceEndpoint,
                    requestEntity,
                    Map.class);
            
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                log.info("Successfully uploaded file {} to storage service", file.getOriginalFilename());
                return ResponseEntity.ok(responseEntity.getBody());
            } else {
                log.error("Error uploading file to storage service: {}", responseEntity.getStatusCode());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to upload file"));
            }
        } catch (IOException e) {
            log.error("Error reading file for upload: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to read file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
} 