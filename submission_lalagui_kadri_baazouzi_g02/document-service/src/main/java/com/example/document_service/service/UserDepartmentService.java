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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDepartmentService {

    private final UserDepartmentRepository userDepartmentRepository;
    private final DepartmentRepository departmentRepository; // To validate department exists

    @Transactional
    public void assignUserToDepartment(String userId, Long departmentId) {
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
        log.debug("Fetching department IDs for user {}", userId);
        List<UserDepartmentAssignment> assignments = userDepartmentRepository.findByIdUserId(userId);
        List<Long> departmentIds = assignments.stream()
                .map(assignment -> assignment.getId().getDepartmentId())
                .collect(Collectors.toList());
        log.debug("Found {} department assignments for user {}", departmentIds.size(), userId);
        return departmentIds;
    }

     @Transactional(readOnly = true)
    public List<Department> getUserDepartments(String userId) {
        log.debug("Fetching department entities for user {}", userId);
         List<UserDepartmentAssignment> assignments = userDepartmentRepository.findByIdUserId(userId);
         return assignments.stream()
                 .map(UserDepartmentAssignment::getDepartment) // Assumes department is fetched eagerly or context is open
                 .collect(Collectors.toList());
         // Note: Be mindful of lazy loading if the transaction boundary is different
    }
}
