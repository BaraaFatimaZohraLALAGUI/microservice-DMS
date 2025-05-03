package com.example.document_service.controller;

import com.example.document_service.dto.DepartmentDto;
import com.example.document_service.dto.UserAssignmentDto;
import com.example.document_service.service.DepartmentService;
import com.example.document_service.service.UserDepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;
    private final UserDepartmentService userDepartmentService; // For user assignments

    // --- Department CRUD (Admin Only) ---

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentDto departmentDto) {
         DepartmentDto created = departmentService.createDepartment(new DepartmentDto(null, departmentDto.name()));
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')") // Allow users to view departments
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<DepartmentDto> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

     @GetMapping("/{id}")
     @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
     public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable Long id) {
         DepartmentDto department = departmentService.getDepartmentById(id);
         return ResponseEntity.ok(department);
     }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDto> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentDto departmentDto) {
        DepartmentDto updated = departmentService.updateDepartment(id, departmentDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    // --- User Assignment (Admin Only) ---

    @PostMapping("/{deptId}/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignUserToDepartment(@PathVariable Long deptId, @Valid @RequestBody UserAssignmentDto userAssignmentDto) {
        userDepartmentService.assignUserToDepartment(userAssignmentDto.userId(), deptId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{deptId}/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unassignUserFromDepartment(@PathVariable Long deptId, @PathVariable String userId) {
         userDepartmentService.unassignUserFromDepartment(userId, deptId);
        return ResponseEntity.noContent().build();
    }
}