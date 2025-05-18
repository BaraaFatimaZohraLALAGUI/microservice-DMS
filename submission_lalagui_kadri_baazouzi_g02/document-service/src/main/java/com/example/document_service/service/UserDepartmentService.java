package com.example.document_service.service;

import com.example.document_service.exception.ResourceNotFoundException;
import com.example.document_service.model.Department;
import com.example.document_service.model.UserDepartmentAssignment;
import com.example.document_service.model.UserDepartmentId;
import com.example.document_service.repository.DepartmentRepository;
import com.example.document_service.repository.UserDepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDepartmentService {

    private final UserDepartmentRepository userDepartmentRepository;
    private final DepartmentRepository departmentRepository; // To validate department exists

    /**
     * Gets a default department ID for users who don't have any department assignments.
     * This is useful for ensuring users can always see documents they create.
     *
     * @return The ID of the default department (typically "General") or the first department found
     * @throws ResourceNotFoundException if no departments exist at all
     */
    @Transactional(readOnly = true)
    public Long getDefaultDepartmentId() {
        // First try to find the "General" department if it exists
        Optional<Department> generalDepartment = departmentRepository.findByName("General");
        if (generalDepartment.isPresent()) {
            return generalDepartment.get().getId();
        }
        
        // Otherwise, get the first department (any department is better than none)
        return departmentRepository.findAll().stream()
                .findFirst()
                .map(Department::getId)
                .orElseThrow(() -> new ResourceNotFoundException("No departments exist in the system"));
    }

    @Transactional
    public void assignUserToDepartment(String userId, Long departmentId) {
        // Check for valid inputs
        if (userId == null || userId.isEmpty() || departmentId == null) {
            log.warn("Invalid input: userId={}, departmentId={}", userId, departmentId);
            throw new IllegalArgumentException("User ID and department ID must be valid");
        }
        
        log.info("Assigning user {} to department {}", userId, departmentId);
        // Validate department exists
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

        UserDepartmentId id = new UserDepartmentId(userId, departmentId);

        // Avoid duplicates (optional, DB constraint should handle it too)
        if (userDepartmentRepository.existsById(id)) {
             log.warn("User {} is already assigned to department {}", userId, departmentId);
             return; // Or throw a conflict exception
        }

        UserDepartmentAssignment assignment = new UserDepartmentAssignment(id, department);
        userDepartmentRepository.save(assignment);
        log.info("Successfully assigned user {} to department {}", userId, departmentId);
    }

    @Transactional
    public void unassignUserFromDepartment(String userId, Long departmentId) {
         // Check for valid inputs
        if (userId == null || userId.isEmpty() || departmentId == null) {
            log.warn("Invalid input: userId={}, departmentId={}", userId, departmentId);
            throw new IllegalArgumentException("User ID and department ID must be valid");
        }
        
        log.info("Unassigning user {} from department {}", userId, departmentId);
        // Check if assignment exists before deleting
        UserDepartmentId id = new UserDepartmentId(userId, departmentId);
        if (!userDepartmentRepository.existsById(id)) {
            log.warn("Assignment for user {} to department {} not found.", userId, departmentId);
            throw new ResourceNotFoundException("User assignment not found"); // Or just return void
        }
        userDepartmentRepository.deleteByIdUserIdAndIdDepartmentId(userId, departmentId); // Use specific delete method
        log.info("Successfully unassigned user {} from department {}", userId, departmentId);
    }

    @Transactional(readOnly = true)
    public List<Long> getUserDepartmentIds(String userId) {
        // Handle potential invalid or problematic userIds
        if (userId == null || userId.isEmpty() || "anonymousUser".equals(userId) || "unauthenticated-user".equals(userId)) {
            log.debug("Cannot fetch departments for invalid or unauthenticated user: {}", userId);
            return new ArrayList<>(); // Return empty list for invalid/anonymous users
        }
        
        log.debug("Fetching department IDs for user {}", userId);
        List<UserDepartmentAssignment> assignments = userDepartmentRepository.findByIdUserId(userId);
        
        List<Long> departmentIds = assignments.stream()
                .map(assignment -> assignment.getId().getDepartmentId())
                .collect(Collectors.toList());
                
        log.debug("Found {} department assignments for user {}", departmentIds.size(), userId);
        
        // If user has no assignments, log a more detailed message about this legitimate situation
        if (departmentIds.isEmpty()) {
            log.info("User {} has no department assignments. They may be new or not yet configured.", userId);
        }
        
        return departmentIds;
    }

    @Transactional(readOnly = true)
    public List<Department> getUserDepartments(String userId) {
        // Handle potential invalid or problematic userIds
        if (userId == null || userId.isEmpty() || "anonymousUser".equals(userId) || "unauthenticated-user".equals(userId)) {
            log.debug("Cannot fetch departments for invalid or unauthenticated user: {}", userId);
            return new ArrayList<>(); // Return empty list for invalid/anonymous users
        }
        
        log.debug("Fetching department entities for user {}", userId);
        List<UserDepartmentAssignment> assignments = userDepartmentRepository.findByIdUserId(userId);
        
        List<Department> departments = assignments.stream()
                .map(UserDepartmentAssignment::getDepartment) // Assumes department is fetched eagerly or context is open
                .collect(Collectors.toList());
                
        // If user has no assignments, log a more detailed message
        if (departments.isEmpty()) {
            log.info("User {} has no department assignments. They may be new or not yet configured.", userId);
        }
        
        return departments;
        // Note: Be mindful of lazy loading if the transaction boundary is different
    }
}
