package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.ActivityLog;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.ActivityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityLogResponse>> logActivity(@Valid @RequestBody ActivityLogRequest request) {
        User user = getCurrentUser();
        ActivityLog log = activityService.logActivity(request, user);
        return ResponseEntity.ok(ApiResponse.success("Activity logged successfully", mapToResponse(log)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getActivities() {
        User user = getCurrentUser();
        List<ActivityLogResponse> list = activityService.getActivityLogsForUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityLogResponse>> getActivityById(@PathVariable Long id) {
        User user = getCurrentUser();
        ActivityLog log = activityService.getActivityLogById(id, user);
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(log)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityLogResponse>> updateActivity(@PathVariable Long id, @Valid @RequestBody ActivityLogRequest request) {
        User user = getCurrentUser();
        ActivityLog log = activityService.updateActivityLog(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Activity log updated successfully", mapToResponse(log)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteActivity(@PathVariable Long id) {
        User user = getCurrentUser();
        activityService.deleteActivityLog(id, user);
        return ResponseEntity.ok(ApiResponse.success("Activity log deleted successfully", null));
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
