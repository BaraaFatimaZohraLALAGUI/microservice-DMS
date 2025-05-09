package com.example.document_service.service;

import com.example.document_service.dto.CategoryDto;
import com.example.document_service.exception.ResourceNotFoundException;
import com.example.document_service.model.Category;
import com.example.document_service.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = new Category(categoryDto.name());
        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

     @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setName(categoryDto.name());
        category = categoryRepository.save(category);
        return mapToDto(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
         if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        // Consider checking if any documents use this category before deleting
        categoryRepository.deleteById(id);
    }

    // --- Helper Methods ---
     public Category findCategoryById(Long id) { // For internal use by DocumentService
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private CategoryDto mapToDto(Category category) {
        return new CategoryDto(category.getId(), category.getName());
    }
}