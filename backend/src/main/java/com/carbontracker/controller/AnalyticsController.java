package com.carbontracker.controller;

import com.carbontracker.dto.ApiResponse;
import com.carbontracker.entity.ActivityLog;
import com.carbontracker.entity.Category;
import com.carbontracker.entity.User;
import com.carbontracker.entity.UserCarbonSummary;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.UserCarbonSummaryRepository;
import com.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private UserCarbonSummaryRepository summaryRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<List<UserCarbonSummary>>> getWeeklyAnalytics() {
        User user = getCurrentUser();
        int currentYear = LocalDate.now().getYear();
        List<UserCarbonSummary> weeklySummaries = summaryRepository.findByUserIdAndYearOrderByMonthAscWeekNumberAsc(
                user.getId(), currentYear
        );
        return ResponseEntity.ok(ApiResponse.success(weeklySummaries));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getMonthlyAnalytics() {
        User user = getCurrentUser();
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());

        Map<String, Double> monthlyEmissions = new LinkedHashMap<>();
        // Group and sum by Year-Month
        logs.stream()
                .sorted(Comparator.comparing(ActivityLog::getLogDate))
                .forEach(log -> {
                    String key = log.getLogDate().getYear() + "-" + String.format("%02d", log.getLogDate().getMonthValue());
                    monthlyEmissions.put(key, monthlyEmissions.getOrDefault(key, 0.0) + log.getCarbonEmission());
                });

        return ResponseEntity.ok(ApiResponse.success(monthlyEmissions));
    }

    @GetMapping("/category")
    public ResponseEntity<ApiResponse<Map<Category, Double>>> getCategoryAnalytics() {
        User user = getCurrentUser();
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());

        Map<Category, Double> categoryTotals = new EnumMap<>(Category.class);
        for (Category cat : Category.values()) {
            categoryTotals.put(cat, 0.0);
        }

        for (ActivityLog log : logs) {
            categoryTotals.put(log.getCategory(), categoryTotals.get(log.getCategory()) + log.getCarbonEmission());
        }

        return ResponseEntity.ok(ApiResponse.success(categoryTotals));
    }

    @GetMapping("/benchmark")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getBenchmark() {
        User user = getCurrentUser();
        List<ActivityLog> userLogs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        List<ActivityLog> allLogs = activityLogRepository.findAll();

        double userTotal = userLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        double userAvg = userLogs.isEmpty() ? 0.0 : userTotal / userLogs.stream().map(ActivityLog::getLogDate).collect(Collectors.toSet()).size();

        // Calculate global average per user day
        double globalTotal = allLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        long totalUsers = userRepository.count();
        double globalAvg = totalUsers == 0 ? 0.0 : globalTotal / totalUsers;

        Map<String, Double> benchmark = new HashMap<>();
        benchmark.put("user_average", userAvg);
        benchmark.put("global_average", globalAvg);

        return ResponseEntity.ok(ApiResponse.success(benchmark));
    }
}
