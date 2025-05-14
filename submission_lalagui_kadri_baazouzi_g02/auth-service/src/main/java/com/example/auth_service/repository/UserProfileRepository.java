package com.example.auth_service.repository;

import com.example.auth_service.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for accessing and managing UserProfile entities
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, String> {
    
    /**
     * Find a user profile by username
     * @param username the username to search for
     * @return Optional containing the profile if found
     */
    Optional<UserProfile> findByUsername(String username);
    
    /**
     * Find user profiles by department
     * @param department the department name to search for
     * @return List of user profiles in the specified department
     */
    java.util.List<UserProfile> findByDepartment(String department);
} 