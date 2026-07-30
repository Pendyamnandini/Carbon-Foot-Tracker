package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.User;
import com.carbontracker.entity.UploadedFile;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.entity.UserBadge;
import com.carbontracker.service.BadgeService;
import com.carbontracker.service.FileStorageService;
import com.carbontracker.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody ChangePasswordRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect old password");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        String password = request.getNewPassword();
        if (password.length() < 8 || 
            !password.matches(".*[a-zA-Z].*") || 
            !password.matches(".*[0-9].*") || 
            !password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            throw new IllegalArgumentException("Password is too weak. It must be at least 8 characters, alphanumeric, and contain a special character.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditLogService.logActivity(user, "UPDATE", "Password Change", "Changed account password from settings", "Settings Page", null, null);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/badges")
    public ResponseEntity<ApiResponse<List<UserBadge>>> getMyBadges() {
        User user = getCurrentUser();
        List<UserBadge> badges = badgeService.getUserBadges(user);
        auditLogService.logActivity(user, "VIEW", "View Badges", "Viewed badges tab in profile", "Profile", null, null);
        return ResponseEntity.ok(ApiResponse.success(badges));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile() {
        User user = getCurrentUser();
        UserProfileResponse response = mapToResponse(user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@RequestBody UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getMobileNumber() != null) user.setMobileNumber(request.getMobileNumber());
        if (request.getSustainabilityPreferences() != null) user.setSustainabilityPreferences(request.getSustainabilityPreferences());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());

        User updatedUser = userRepository.save(user);

        auditLogService.log(user, "UPDATE_PROFILE", "User", user.getId(), "Updated profile details");
        auditLogService.logActivity(user, "UPDATE", "Profile Updates", "Updated profile details", "Profile", null, null);

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", mapToResponse(updatedUser)));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        User user = getCurrentUser();
        UploadedFile uploadedFile = fileStorageService.storeFile(file, user);
        
        user.setProfileImageUrl(uploadedFile.getFileUrl());
        userRepository.save(user);

        auditLogService.log(user, "UPLOAD_PROFILE_IMAGE", "UploadedFile", uploadedFile.getId(), "Uploaded profile image: " + uploadedFile.getFileName());
        auditLogService.logActivity(user, "UPDATE", "Profile Image Upload", "Uploaded profile image", "Profile", null, null);

        return ResponseEntity.ok(ApiResponse.success("Profile image uploaded successfully", uploadedFile.getFileUrl()));
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole().name())
                .profileImageUrl(user.getProfileImageUrl())
                .sustainabilityPreferences(user.getSustainabilityPreferences())
                .active(user.isActive())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .country(user.getCountry())
                .state(user.getState())
                .city(user.getCity())
                .build();
    }
}
