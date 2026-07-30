package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.AnalyticsService;
import com.carbontracker.service.AnalyticsV1Service;
import com.carbontracker.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class AnalyticsV1Controller {

    @Autowired
    private AnalyticsV1Service analyticsV1Service;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping("/analytics/daily")
    @org.springframework.cache.annotation.Cacheable(value = "analytics", key = "'v1_daily_' + #root.target.getCurrentUserEmail() + '_' + #date + '_' + #startDate + '_' + #endDate")
    public ResponseEntity<ApiResponse<PeriodAnalyticsResponse>> getDaily(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = getCurrentUser();
        
        if (date == null && startDate == null && endDate == null) {
            auditLogService.logActivity(user, "VIEW", "Dashboard Visit", "Visited carbon emission dashboard", "Dashboard", null, null);
        }

        PeriodAnalyticsResponse response = analyticsV1Service.getPeriodAnalytics(user, "DAILY", date, null, null, null, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/analytics/weekly")
    @org.springframework.cache.annotation.Cacheable(value = "analytics", key = "'v1_weekly_' + #root.target.getCurrentUserEmail() + '_' + #week + '_' + #year")
    public ResponseEntity<ApiResponse<PeriodAnalyticsResponse>> getWeekly(
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) Integer year) {
        User user = getCurrentUser();
        PeriodAnalyticsResponse response = analyticsV1Service.getPeriodAnalytics(user, "WEEKLY", null, week, null, year, null, null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/analytics/monthly")
    @org.springframework.cache.annotation.Cacheable(value = "analytics", key = "'v1_monthly_' + #root.target.getCurrentUserEmail() + '_' + #month + '_' + #year")
    public ResponseEntity<ApiResponse<PeriodAnalyticsResponse>> getMonthly(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        User user = getCurrentUser();
        PeriodAnalyticsResponse response = analyticsV1Service.getPeriodAnalytics(user, "MONTHLY", null, null, month, year, null, null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/analytics/yearly")
    @org.springframework.cache.annotation.Cacheable(value = "analytics", key = "'v1_yearly_' + #root.target.getCurrentUserEmail() + '_' + #year")
    public ResponseEntity<ApiResponse<PeriodAnalyticsResponse>> getYearly(
            @RequestParam(required = false) Integer year) {
        User user = getCurrentUser();
        PeriodAnalyticsResponse response = analyticsV1Service.getPeriodAnalytics(user, "YEARLY", null, null, null, year, null, null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/analytics/date-range")
    @org.springframework.cache.annotation.Cacheable(value = "analytics", key = "'v1_daterange_' + #root.target.getCurrentUserEmail() + '_' + #startDate + '_' + #endDate")
    public ResponseEntity<ApiResponse<PeriodAnalyticsResponse>> getDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = getCurrentUser();
        
        // Log search activity
        String meta = "{\"startDate\":\"" + startDate + "\",\"endDate\":\"" + endDate + "\"}";
        auditLogService.logActivity(user, "SEARCH", "Analytics Date Range", "Searched analytics from " + startDate + " to " + endDate, "Dashboard", meta, null);

        PeriodAnalyticsResponse response = analyticsV1Service.getPeriodAnalytics(user, "CUSTOM", null, null, null, null, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/analytics/category-breakdown")
    public ResponseEntity<ApiResponse<List<CategoryBreakdownResponse>>> getCategoryBreakdown(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        User user = getCurrentUser();
        if (startDate != null && endDate != null) {
            DateRangeAnalyticsResponse range = analyticsService.getDateRangeAnalytics(user, startDate, endDate);
            double total = range.getTransportTotal() + range.getElectricityTotal() + range.getFoodTotal() + range.getShoppingTotal();
            List<CategoryBreakdownResponse> res = new ArrayList<>();
            res.add(new CategoryBreakdownResponse("TRANSPORT", range.getTransportTotal(), total > 0 ? (range.getTransportTotal() / total) * 100 : 0));
            res.add(new CategoryBreakdownResponse("ELECTRICITY", range.getElectricityTotal(), total > 0 ? (range.getElectricityTotal() / total) * 100 : 0));
            res.add(new CategoryBreakdownResponse("FOOD", range.getFoodTotal(), total > 0 ? (range.getFoodTotal() / total) * 100 : 0));
            res.add(new CategoryBreakdownResponse("SHOPPING", range.getShoppingTotal(), total > 0 ? (range.getShoppingTotal() / total) * 100 : 0));
            return ResponseEntity.ok(ApiResponse.success(res));
        }
        return ResponseEntity.ok(ApiResponse.success(analyticsV1Service.getCategoryBreakdown(user)));
    }

    @GetMapping("/analytics/trends")
    public ResponseEntity<ApiResponse<TrendAnalysisResponse>> getTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        User user = getCurrentUser();
        if (startDate != null && endDate != null) {
            DateRangeAnalyticsResponse range = analyticsService.getDateRangeAnalytics(user, startDate, endDate);
            TrendAnalysisResponse res = TrendAnalysisResponse.builder()
                    .dailyTrend(range.getTrend())
                    .weeklyTrend(range.getTrend())
                    .monthlyTrend(range.getTrend())
                    .insights(List.of("You had average daily emissions of " + String.format("%.2f", range.getAverageDailyEmissions()) + " kg during this period."))
                    .build();
            return ResponseEntity.ok(ApiResponse.success(res));
        }
        return ResponseEntity.ok(ApiResponse.success(analyticsV1Service.getTrendsAndInsights(user)));
    }

    @GetMapping("/benchmarking")
    public ResponseEntity<ApiResponse<BenchmarkingResponse>> getBenchmarking() {
        User user = getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(analyticsV1Service.getBenchmarking(user)));
    }
}
