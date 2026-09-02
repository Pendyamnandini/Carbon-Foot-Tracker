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

import com.carbontracker.service.ai.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    private final ObjectMapper mapper = new ObjectMapper();

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

    @PostMapping("/nlp")
    public ResponseEntity<ApiResponse<ActivityLogResponse>> logActivityNlp(@RequestBody java.util.Map<String, String> request) {
        User user = getCurrentUser();
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }

        String systemPrompt = "Extract carbon footprint activity from the text. Respond ONLY with a valid JSON object matching exactly this structure: {\"category\": \"string (TRANSPORT|ELECTRICITY|FOOD|SHOPPING)\", \"activityType\": \"string\", \"quantity\": float}. For example: {\"category\":\"TRANSPORT\", \"activityType\":\"Car Travel\", \"quantity\":20.0}. If the language is not English, translate it first mentally, then provide the JSON.";
        String json = geminiService.analyzeText(text, systemPrompt);

        try {
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(json);
            if (!root.has("category") || !root.has("quantity")) {
                throw new IllegalArgumentException("Could not understand activity");
            }
            ActivityLogRequest dto = new ActivityLogRequest();
            dto.setCategory(com.carbontracker.entity.Category.valueOf(root.get("category").asText()));
            dto.setActivityType(root.get("activityType").asText());
            dto.setQuantity(root.get("quantity").asDouble());
            dto.setLogDate(java.time.LocalDate.now());
            
            ActivityLog log = activityService.logActivity(dto, user);
            return ResponseEntity.ok(ApiResponse.success("Activity logged via NLP successfully", mapToResponse(log)));
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to extract activity from text. Please try again or use manual entry.", e);
        }
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
