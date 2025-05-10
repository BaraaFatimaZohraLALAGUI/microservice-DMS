package com.example.document_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDepartmentId implements Serializable {

    @Column(name = "user_id", nullable = false)
    private String userId; // Match type from Auth Service (e.g., String for UUID)

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    // equals() and hashCode() are crucial for composite keys
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDepartmentId that = (UserDepartmentId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(departmentId, that.departmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, departmentId);
    }
}
