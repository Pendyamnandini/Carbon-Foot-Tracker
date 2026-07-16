package com.carbontracker.controller;

import com.carbontracker.dto.ApiResponse;
import com.carbontracker.dto.CarbonAggregationProjection;
import com.carbontracker.entity.Category;
import com.carbontracker.entity.User;
import com.carbontracker.entity.UserCarbonSummary;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.UserCarbonSummaryRepository;
import com.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private UserCarbonSummaryRepository summaryRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    public String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/weekly")
    @Cacheable(value = "analytics", key = "'weekly_' + #root.target.getCurrentUserEmail()")
    public ResponseEntity<ApiResponse<List<UserCarbonSummary>>> getWeeklyAnalytics() {
        User user = getCurrentUser();
        int currentYear = LocalDate.now().getYear();
        List<UserCarbonSummary> weeklySummaries = summaryRepository.findByUserIdAndYearOrderByMonthAscWeekNumberAsc(
                user.getId(), currentYear
        );
        return ResponseEntity.ok(ApiResponse.success(weeklySummaries));
    }

    @GetMapping("/monthly")
    @Cacheable(value = "analytics", key = "'monthly_' + #root.target.getCurrentUserEmail()")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getMonthlyAnalytics() {
        User user = getCurrentUser();
        List<CarbonAggregationProjection> monthlyProjections = activityLogRepository.findMonthlyTotals(user.getId());

        Map<String, Double> monthlyEmissions = new LinkedHashMap<>();
        for (CarbonAggregationProjection proj : monthlyProjections) {
            String key = proj.getGroupKey();
            double value = proj.getTotalEmission() != null ? proj.getTotalEmission() : 0.0;
            monthlyEmissions.put(key, monthlyEmissions.getOrDefault(key, 0.0) + value);
        }

        return ResponseEntity.ok(ApiResponse.success(monthlyEmissions));
    }

    @GetMapping("/category")
    @Cacheable(value = "analytics", key = "'category_' + #root.target.getCurrentUserEmail()")
    public ResponseEntity<ApiResponse<Map<Category, Double>>> getCategoryAnalytics() {
        User user = getCurrentUser();
        List<CarbonAggregationProjection> categoryProjections = activityLogRepository.findCategoryTotals(user.getId());

        Map<Category, Double> categoryTotals = new EnumMap<>(Category.class);
        for (Category cat : Category.values()) {
            categoryTotals.put(cat, 0.0);
        }

        for (CarbonAggregationProjection proj : categoryProjections) {
            if (proj.getCategory() != null) {
                double value = proj.getTotalEmission() != null ? proj.getTotalEmission() : 0.0;
                categoryTotals.put(proj.getCategory(), value);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(categoryTotals));
    }

    @GetMapping("/benchmark")
    @Cacheable(value = "analytics", key = "'benchmark_' + #root.target.getCurrentUserEmail()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBenchmark() {
        User currentUser = getCurrentUser();
        List<User> allUsers = userRepository.findAll();
        
        // Calculate platform-wide emissions per category
        Map<Category, Double> totalEmissionsPerCategory = new EnumMap<>(Category.class);
        for (Category c : Category.values()) {
            totalEmissionsPerCategory.put(c, 0.0);
        }

        // Sum up total carbon per user for percentile standing
        Map<Long, Double> userFootprints = new HashMap<>();
        for (User u : allUsers) {
            userFootprints.put(u.getId(), 0.0);
        }

        List<com.carbontracker.entity.ActivityLog> allLogs = activityLogRepository.findAll();
        for (com.carbontracker.entity.ActivityLog log : allLogs) {
            if (log.getUser() != null) {
                Long uId = log.getUser().getId();
                userFootprints.put(uId, userFootprints.getOrDefault(uId, 0.0) + log.getCarbonEmission());
                totalEmissionsPerCategory.put(log.getCategory(), totalEmissionsPerCategory.get(log.getCategory()) + log.getCarbonEmission());
            }
        }

        // Platform category averages
        long userCount = allUsers.size();
        Map<String, Object> response = new LinkedHashMap<>();
        for (Category c : Category.values()) {
            double avg = userCount == 0 ? 0.0 : totalEmissionsPerCategory.get(c) / userCount;
            String key = c.name().toLowerCase() + "Average";
            response.put(key, Math.round(avg * 10.0) / 10.0);
        }

        // Calculate Percentile standing (emit less than X% of others)
        double currentUserEmissions = userFootprints.getOrDefault(currentUser.getId(), 0.0);
        long usersEmittingMore = userFootprints.values().stream()
                .filter(footprint -> footprint > currentUserEmissions)
                .count();

        long percentile = 100;
        if (userCount > 1) {
            percentile = (usersEmittingMore * 100) / (userCount - 1);
        }
        response.put("userPercentile", percentile);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
