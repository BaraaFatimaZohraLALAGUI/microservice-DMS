package com.example.document_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDepartmentAssignment {

    @EmbeddedId
    private UserDepartmentId id;

    // Optional: If you need to reference the Department entity directly
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("departmentId") // Maps the departmentId part of the embedded ID
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    // We don't have a User entity here, so no @ManyToOne for user
}