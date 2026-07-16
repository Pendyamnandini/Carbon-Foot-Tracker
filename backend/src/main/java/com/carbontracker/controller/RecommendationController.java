package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> getRecommendations() {
        User user = getCurrentUser();
        List<RecommendationResponse> recs = recommendationService.generateRecommendations(user);
        return ResponseEntity.ok(ApiResponse.success(recs));
    }
}
