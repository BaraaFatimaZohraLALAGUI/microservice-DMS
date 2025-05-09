package com.example.document_service.controller;

import com.example.document_service.dto.CategoryDto;
import com.example.document_service.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Secure all endpoints in this controller for ADMIN
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
        // Ignore ID if passed in request body for creation
        CategoryDto created = categoryService.createCategory(new CategoryDto(null, categoryDto.name()));
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')") // Allow users to view categories too
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

     @GetMapping("/{id}")
     @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
     public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long id) {
         CategoryDto category = categoryService.getCategoryById(id);
         return ResponseEntity.ok(category);
     }


    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDto categoryDto) {
        CategoryDto updated = categoryService.updateCategory(id, categoryDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}