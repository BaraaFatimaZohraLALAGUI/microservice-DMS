package com.example.auth_service.service;

import com.example.auth_service.model.UserProfile;
import com.example.auth_service.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for managing user profiles
 */
@Service
@RequiredArgsConstructor
public class UserProfileService {
    
    private final UserProfileRepository userProfileRepository;
    
    /**
     * Get a user profile by username
     * @param username the username to search for
     * @return the user profile or null if not found
     */
    public UserProfile getProfileByUsername(String username) {
        return userProfileRepository.findByUsername(username).orElse(null);
    }
    
    /**
     * Save or update a user profile
     * @param profile the profile to save
     * @return the saved profile
     */
    public UserProfile saveProfile(UserProfile profile) {
        return userProfileRepository.save(profile);
    }
    
    /**
     * Delete a user profile
     * @param username the username of the profile to delete
     */
    public void deleteProfile(String username) {
        userProfileRepository.deleteById(username);
    }
    
    /**
     * Get all user profiles
     * @return list of all user profiles
     */
    public List<UserProfile> getAllProfiles() {
        return userProfileRepository.findAll();
    }
    
    /**
     * Get all profiles for a specific department
     * @param department the department name
     * @return list of profiles in the department
     */
    public List<UserProfile> getProfilesByDepartment(String department) {
        return userProfileRepository.findByDepartment(department);
    }
} 