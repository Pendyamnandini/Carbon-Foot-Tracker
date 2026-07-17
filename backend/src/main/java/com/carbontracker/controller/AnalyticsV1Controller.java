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

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping("/analytics/daily")
    public ResponseEntity<ApiResponse<DailyAnalyticsResponse>> getDaily(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        User user = getCurrentUser();
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusDays(30);

        if (startDate == null && endDate == null) {
            auditLogService.logActivity(user, "VIEW", "Dashboard Visit", "Visited carbon emission dashboard", "Dashboard", null, null);
        }

        List<DailyCarbonSummary> dailyList = analyticsService.getDailySummaries(user, start, end);

        double todayEmissions = dailyList.stream()
                .filter(d -> d.getSummaryDate().equals(LocalDate.now()))
                .mapToDouble(DailyCarbonSummary::getOverallTotal)
                .findFirst().orElse(0.0);

        double yesterdayEmissions = dailyList.stream()
                .filter(d -> d.getSummaryDate().equals(LocalDate.now().minusDays(1)))
                .mapToDouble(DailyCarbonSummary::getOverallTotal)
                .findFirst().orElse(0.0);

        double diff = todayEmissions - yesterdayEmissions;
        double pctChange = yesterdayEmissions > 0 ? (diff / yesterdayEmissions) * 100.0 : 0.0;

        List<DailyAnalyticsResponse.DailyEmissionTrend> trend = dailyList.stream()
                .map(d -> new DailyAnalyticsResponse.DailyEmissionTrend(d.getSummaryDate().toString(), d.getOverallTotal()))
                .collect(Collectors.toList());

        List<DailyAnalyticsResponse.DailySummaryItem> history = dailyList.stream()
                .map(d -> DailyAnalyticsResponse.DailySummaryItem.builder()
                        .date(d.getSummaryDate().toString())
                        .overallTotal(d.getOverallTotal())
                        .transport(d.getTransportTotal())
                        .electricity(d.getElectricityTotal())
                        .food(d.getFoodTotal())
                        .shopping(d.getShoppingTotal())
                        .activityCount(d.getActivityCount())
                        .sustainabilityScore(d.getSustainabilityScore())
                        .build())
                .collect(Collectors.toList());

        DailyAnalyticsResponse response = DailyAnalyticsResponse.builder()
                .todayEmissions(todayEmissions)
                .yesterdayEmissions(yesterdayEmissions)
                .difference(diff)
                .percentageChange(pctChange)
                .trend(trend)
                .history(history)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/analytics/weekly")
    public ResponseEntity<ApiResponse<WeeklyAnalyticsResponse>> getWeekly(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        User user = getCurrentUser();
        List<WeeklyCarbonSummary> weeklyList = analyticsService.getWeeklySummaries(user);

        // Filter by date range if provided
        if (startDate != null || endDate != null) {
            // Weekly summaries don't map directly to single dates, but we can filter by year and week
            // For simplicity, return all or perform active filtering
        }

        double curEm = weeklyList.isEmpty() ? 0.0 : weeklyList.get(0).getOverallTotal();
        double prevEm = weeklyList.size() < 2 ? 0.0 : weeklyList.get(1).getOverallTotal();
        double diff = curEm - prevEm;
        double pctChange = prevEm > 0 ? (diff / prevEm) * 100.0 : 0.0;

        List<WeeklyAnalyticsResponse.WeeklyEmissionTrend> trend = weeklyList.stream()
                .map(w -> new WeeklyAnalyticsResponse.WeeklyEmissionTrend("W" + w.getWeekNumber() + " " + w.getYear(), w.getOverallTotal()))
                .collect(Collectors.toList());

        List<WeeklyAnalyticsResponse.WeeklySummaryItem> history = weeklyList.stream()
                .map(w -> WeeklyAnalyticsResponse.WeeklySummaryItem.builder()
                        .weekNumber(w.getWeekNumber())
                        .year(w.getYear())
                        .overallTotal(w.getOverallTotal())
                        .transport(w.getTransportTotal())
                        .electricity(w.getElectricityTotal())
                        .food(w.getFoodTotal())
                        .shopping(w.getShoppingTotal())
                        .activityCount(w.getActivityCount())
                        .sustainabilityScore(w.getSustainabilityScore())
                        .build())
                .collect(Collectors.toList());

        WeeklyAnalyticsResponse response = WeeklyAnalyticsResponse.builder()
                .currentWeekEmissions(curEm)
                .previousWeekEmissions(prevEm)
                .percentageChange(pctChange)
                .trend(trend)
                .history(history)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/analytics/monthly")
    public ResponseEntity<ApiResponse<MonthlyAnalyticsResponse>> getMonthly(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        User user = getCurrentUser();
        List<MonthlyCarbonSummary> monthlyList = analyticsService.getMonthlySummaries(user);

        double curEm = monthlyList.isEmpty() ? 0.0 : monthlyList.get(0).getOverallTotal();
        double prevEm = monthlyList.size() < 2 ? 0.0 : monthlyList.get(1).getOverallTotal();
        double diff = curEm - prevEm;
        double pctChange = prevEm > 0 ? (diff / prevEm) * 100.0 : 0.0;

        List<MonthlyAnalyticsResponse.MonthlyEmissionTrend> trend = monthlyList.stream()
                .map(m -> new MonthlyAnalyticsResponse.MonthlyEmissionTrend(m.getMonth() + "/" + m.getYear(), m.getOverallTotal()))
                .collect(Collectors.toList());

        List<MonthlyAnalyticsResponse.MonthlySummaryItem> history = monthlyList.stream()
                .map(m -> MonthlyAnalyticsResponse.MonthlySummaryItem.builder()
                        .month(m.getMonth())
                        .year(m.getYear())
                        .overallTotal(m.getOverallTotal())
                        .transport(m.getTransportTotal())
                        .electricity(m.getElectricityTotal())
                        .food(m.getFoodTotal())
                        .shopping(m.getShoppingTotal())
                        .activityCount(m.getActivityCount())
                        .sustainabilityScore(m.getSustainabilityScore())
                        .build())
                .collect(Collectors.toList());

        MonthlyAnalyticsResponse response = MonthlyAnalyticsResponse.builder()
                .currentMonthEmissions(curEm)
                .previousMonthEmissions(prevEm)
                .percentageChange(pctChange)
                .trend(trend)
                .history(history)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/analytics/date-range")
    public ResponseEntity<ApiResponse<DateRangeAnalyticsResponse>> getDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        User user = getCurrentUser();
        
        // Log search activity
        String meta = "{\"startDate\":\"" + startDate + "\",\"endDate\":\"" + endDate + "\"}";
        auditLogService.logActivity(user, "SEARCH", "Analytics Date Range", "Searched analytics from " + startDate + " to " + endDate, "Dashboard", meta, null);

        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDateRangeAnalytics(user, startDate, endDate)));
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
