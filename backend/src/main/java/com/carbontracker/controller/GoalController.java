package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.Goal;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(@Valid @RequestBody GoalRequest request) {
        User user = getCurrentUser();
        Goal goal = goalService.createGoal(
                user,
                request.getGoalTitle(),
                request.getTargetReductionPercentage(),
                request.getStartDate(),
                request.getTargetDate()
        );
        return ResponseEntity.ok(ApiResponse.success("Goal created successfully", mapToResponse(goal)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals() {
        User user = getCurrentUser();
        List<GoalResponse> list = goalService.getGoalsForUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteGoal(@PathVariable Long id) {
        User user = getCurrentUser();
        goalService.deleteGoal(id, user);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", null));
    }

    private GoalResponse mapToResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser().getId())
                .goalTitle(goal.getGoalTitle())
                .targetReductionPercentage(goal.getTargetReductionPercentage())
                .startDate(goal.getStartDate())
                .targetDate(goal.getTargetDate())
                .currentProgress(goal.getCurrentProgress())
                .status(goal.getStatus().name())
                .build();
    }
}
