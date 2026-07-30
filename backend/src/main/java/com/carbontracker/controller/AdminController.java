package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import com.carbontracker.service.AdminService;
import com.carbontracker.service.FeedbackService;
import com.carbontracker.service.AuditLogService;
import com.carbontracker.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private EmissionFactorRepository emissionFactorRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    private User getCurrentAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAllUsers() {
        List<UserProfileResponse> users = userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getAllActivities() {
        List<ActivityLogResponse> activities = activityLogRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(activities));
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getAllFeedbacks() {
        List<FeedbackResponse> feedbacks = feedbackService.getAllFeedbackForAdmin();
        return ResponseEntity.ok(ApiResponse.success(feedbacks));
    }

    @PutMapping("/feedbacks/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateFeedbackStatus(@PathVariable Long id, @RequestParam FeedbackStatus status) {
        User admin = getCurrentAdmin();
        feedbackService.updateFeedbackStatus(id, status, admin);
        return ResponseEntity.ok(ApiResponse.success("Feedback status updated successfully", null));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getReports() {
        AdminDashboardResponse response = adminService.getDashboardStatistics();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/emission-factors/{id}")
    public ResponseEntity<ApiResponse<EmissionFactor>> updateEmissionFactor(
            @PathVariable Long id, 
            @RequestParam double factor,
            @RequestParam(required = false, defaultValue = "1.0") String version) {
        User admin = getCurrentAdmin();
        EmissionFactor ef = emissionFactorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Emission factor not found"));

        ef.setFactor(factor);
        ef.setVersion(version);
        EmissionFactor saved = emissionFactorRepository.save(ef);

        auditLogService.log(admin, "UPDATE_EMISSION_FACTOR", "EmissionFactor", saved.getId(), "Updated " + ef.getActivityType() + " factor to " + factor);

        userRepository.findAll().forEach(u -> {
            try {
                recommendationService.refreshRecommendations(u);
            } catch (Exception ignored) {}
        });

        return ResponseEntity.ok(ApiResponse.success("Emission factor updated successfully", saved));
    }

    @GetMapping("/emission-factors")
    public ResponseEntity<ApiResponse<List<EmissionFactor>>> getEmissionFactors() {
        return ResponseEntity.ok(ApiResponse.success(emissionFactorRepository.findAll()));
    }

    @GetMapping("/badges")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> getAdminBadges() {
        List<UserBadge> list = userBadgeRepository.findAll();
        List<java.util.Map<String, Object>> res = list.stream().map(ub -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", ub.getId());
            m.put("userId", ub.getUser().getId());
            m.put("userFullName", ub.getUser().getFullName());
            m.put("userEmail", ub.getUser().getEmail());
            m.put("badgeName", ub.getBadge().getBadgeName());
            m.put("category", ub.getBadge().getCategory());
            m.put("awardedDate", ub.getAwardedDate());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/certificates")
    public ResponseEntity<ApiResponse<List<Certificate>>> getAdminCertificates() {
        return ResponseEntity.ok(ApiResponse.success(certificateRepository.findAll()));
    }

    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<List<Achievement>>> getAdminAchievements() {
        return ResponseEntity.ok(ApiResponse.success(achievementRepository.findAll()));
    }

    @GetMapping("/rewards")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> getAdminRewards() {
        List<User> list = userRepository.findAll();
        List<java.util.Map<String, Object>> res = list.stream()
            .sorted((u1, u2) -> Integer.compare(
                u2.getRewardPoints() != null ? u2.getRewardPoints() : 0,
                u1.getRewardPoints() != null ? u1.getRewardPoints() : 0
            ))
            .map(u -> {
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("userId", u.getId());
                m.put("fullName", u.getFullName());
                m.put("email", u.getEmail());
                m.put("rewardPoints", u.getRewardPoints() != null ? u.getRewardPoints() : 0);
                m.put("level", u.getLevel() != null ? u.getLevel() : 1);
                return m;
            }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(res));
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

    private ActivityLogResponse mapToResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser().getId())
                .category(log.getCategory())
                .activityType(log.getActivityType())
                .quantity(log.getQuantity())
                .unit(log.getUnit())
                .emissionFactor(log.getEmissionFactor())
                .carbonEmission(log.getCarbonEmission())
                .logDate(log.getLogDate())
                .build();
    }
}
