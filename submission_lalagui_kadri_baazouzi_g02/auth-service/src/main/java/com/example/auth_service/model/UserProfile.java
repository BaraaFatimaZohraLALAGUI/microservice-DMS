package com.example.auth_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Entity class to store extended user profile information
 */
@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
public class UserProfile {
    
    @Id
    private String username;
    
    @Column(length = 100)
    private String name;
    
    @Column(length = 100)
    private String email;
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 100)
    private String position;
    
    @Column(length = 100)
    private String department;
    
    @Column(length = 20)
    private String status;
    
    @Column(length = 255)
    private String address;
    
    @Column(name = "hire_date")
    private Date hireDate;
    
    @Column(name = "employee_id")
    private Integer employeeId;
} 