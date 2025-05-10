package com.example.document_service.repository;
import com.example.document_service.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    // Find documents belonging to specific departments (for user filtering)
    // Use JOIN FETCH to avoid N+1 queries when accessing category/department names later
    @Query("SELECT d FROM Document d JOIN FETCH d.category JOIN FETCH d.department WHERE d.department.id IN :departmentIds")
    Page<Document> findByDepartmentIdIn(List<Long> departmentIds, Pageable pageable);

    // Optional: Find all (for admin)
    @Query("SELECT d FROM Document d JOIN FETCH d.category JOIN FETCH d.department")
    Page<Document> findAllWithDetails(Pageable pageable);

     // Find specific document with details
    @Query("SELECT d FROM Document d JOIN FETCH d.category JOIN FETCH d.department WHERE d.id = :id")
    Optional<Document> findByIdWithDetails(Long id);
}