package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.AnalyticsV1Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationV1Controller {

    @Autowired
    private AnalyticsV1Service analyticsService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @Autowired
    private com.carbontracker.service.AuditLogService auditLogService;

    @GetMapping("/personalized")
    public ResponseEntity<ApiResponse<PersonalizedRecommendationResponse>> getPersonalized() {
        User user = getCurrentUser();
        auditLogService.logActivity(user, "VIEW", "View Recommendations", "Viewed personalized recommendations", "Dashboard", null, null);
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPersonalizedRecommendations(user)));
    }

    @GetMapping("/reduction-tips")
    public ResponseEntity<ApiResponse<List<ReductionTipResponse>>> getReductionTips() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getGeneralReductionTips()));
    }
}
