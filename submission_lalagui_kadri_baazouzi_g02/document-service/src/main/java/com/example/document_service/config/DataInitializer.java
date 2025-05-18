package com.example.document_service.config;

import com.example.document_service.model.Department;
import com.example.document_service.repository.DepartmentRepository;
import com.example.document_service.service.UserDepartmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserDepartmentService userDepartmentService;

    @Override
    @Transactional
    public void run(String... args) {
        // Initialize default department if none exists
        if (departmentRepository.count() == 0) {
            log.info("No departments found. Creating default department...");
            
            Department defaultDepartment = new Department();
            defaultDepartment.setName("General");
            departmentRepository.save(defaultDepartment);
            
            log.info("Created default department 'General' with ID: {}", defaultDepartment.getId());
            
            // Also create an additional department for testing
            Department engineeringDepartment = new Department();
            engineeringDepartment.setName("Engineering");
            departmentRepository.save(engineeringDepartment);
            
            log.info("Created additional department 'Engineering' with ID: {}", engineeringDepartment.getId());
        } else {
            log.info("Departments already exist. Skipping initialization.");
        }
    }
} 