package com.example.document_service.service;

import com.example.document_service.dto.DepartmentDto;
import com.example.document_service.exception.ResourceNotFoundException;
import com.example.document_service.model.Department;
import com.example.document_service.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        Department department = new Department(departmentDto.name());
        department = departmentRepository.save(department);
        return mapToDto(department);
    }

     @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
         return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

     @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
         return mapToDto(department);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto) {
        Department department = departmentRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        department.setName(departmentDto.name());
        department = departmentRepository.save(department);
        return mapToDto(department);
    }

    @Transactional
    public void deleteDepartment(Long id) {
         if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
         // Consider checking user assignments or document links before deleting
         departmentRepository.deleteById(id);
    }

     // --- Helper Methods ---
     public Department findDepartmentById(Long id) { // For internal use
        return departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    private DepartmentDto mapToDto(Department department) {
        return new DepartmentDto(department.getId(), department.getName());
    }
}