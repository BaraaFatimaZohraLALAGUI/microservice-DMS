package com.example.document_service.repository;
import com.example.document_service.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDepartmentRepository extends JpaRepository<UserDepartmentAssignment, UserDepartmentId> {
    // Find all assignments for a specific user
    List<UserDepartmentAssignment> findByIdUserId(String userId);

    // Find a specific assignment
    Optional<UserDepartmentAssignment> findByIdUserIdAndIdDepartmentId(String userId, Long departmentId);

    // Delete a specific assignment (more efficient than find then delete)
    void deleteByIdUserIdAndIdDepartmentId(String userId, Long departmentId);
}