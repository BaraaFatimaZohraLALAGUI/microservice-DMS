package com.example.document_service.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.UNAUTHORIZED, request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Object> handleIllegalStateException(IllegalStateException ex, WebRequest request) {
        log.warn("Illegal state: {}", ex.getMessage());
        
        // Check if this is an authentication-related issue
        if (ex.getMessage().contains("User is not authenticated") || 
            ex.getMessage().contains("Valid user ID is required")) {
            return buildErrorResponse(
                ex, 
                HttpStatus.UNAUTHORIZED, 
                request, 
                "Authentication error: Please log in to access this resource"
            );
        }
        
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

     @ExceptionHandler(MethodArgumentNotValidException.class)
     public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
         String errors = ex.getBindingResult().getFieldErrors().stream()
                 .map(error -> error.getField() + ": " + error.getDefaultMessage())
                 .collect(Collectors.joining(", "));
         log.warn("Validation failed: {}", errors);
         Map<String, Object> body = new LinkedHashMap<>();
         body.put("timestamp", Instant.now());
         body.put("status", HttpStatus.BAD_REQUEST.value());
         body.put("error", "Validation Failed");
         body.put("message", errors);
         body.put("path", request.getDescription(false).replace("uri=", ""));
         return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
     }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex, WebRequest request) {
        log.error("An unexpected error occurred: ", ex); // Log the full stack trace for unexpected errors
        return buildErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    private ResponseEntity<Object> buildErrorResponse(Exception ex, HttpStatus status, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", "")); // Extract path

        return new ResponseEntity<>(body, status);
    }
    
    private ResponseEntity<Object> buildErrorResponse(Exception ex, HttpStatus status, WebRequest request, String userFriendlyMessage) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", userFriendlyMessage);
        body.put("technicalDetails", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", "")); // Extract path

        return new ResponseEntity<>(body, status);
    }
}
