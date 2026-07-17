package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
public class AnalyticsV1Test {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private AnalyticsV1Service analyticsV1Service;

    @Autowired
    private AdminV1Service adminV1Service;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private EmissionFactorRepository emissionFactorRepository;

    @Autowired
    private DailyCarbonSummaryRepository dailyRepository;

    @Autowired
    private WeeklyCarbonSummaryRepository weeklyRepository;

    @Autowired
    private MonthlyCarbonSummaryRepository monthlyRepository;

    @Autowired
    private UserActivityHistoryRepository userActivityHistoryRepository;

    private User testUser;

    @BeforeEach
    public void setup() {
        // Ensure test user exists
        testUser = userRepository.findByEmail("test_analytics_v1@carbontracker.com").orElseGet(() -> {
            User user = User.builder()
                    .fullName("Analytics V1 Test User")
                    .email("test_analytics_v1@carbontracker.com")
                    .password("Password@123")
                    .role(Role.USER)
                    .active(true)
                    .city("Dallas")
                    .country("USA")
                    .build();
            return userRepository.save(user);
        });

        // Clear any old data for this user
        activityLogRepository.deleteAll(activityLogRepository.findByUserIdOrderByLogDateDesc(testUser.getId()));
        dailyRepository.deleteAll();
        weeklyRepository.deleteAll();
        monthlyRepository.deleteAll();
        userActivityHistoryRepository.deleteAll();
    }

    @Test
    public void testDailyAnalyticsAndTrends() {
        // Log activity today
        ActivityLog todayLog = ActivityLog.builder()
                .user(testUser)
                .category(Category.TRANSPORT)
                .activityType("Car Travel")
                .quantity(10.0)
                .unit("km")
                .emissionFactor(0.2)
                .carbonEmission(2.0)
                .logDate(LocalDate.now())
                .build();
        activityLogRepository.save(todayLog);

        // Log activity yesterday
        ActivityLog yesterdayLog = ActivityLog.builder()
                .user(testUser)
                .category(Category.ELECTRICITY)
                .activityType("Grid Electricity")
                .quantity(10.0)
                .unit("kWh")
                .emissionFactor(0.5)
                .carbonEmission(5.0)
                .logDate(LocalDate.now().minusDays(1))
                .build();
        activityLogRepository.save(yesterdayLog);

        DailyAnalyticsResponse daily = analyticsV1Service.getDailyAnalytics(testUser);
        assertNotNull(daily);
        assertEquals(2.0, daily.getTodayEmissions());
        assertEquals(5.0, daily.getYesterdayEmissions());
        assertEquals(-60.0, daily.getPercentageChange()); // ((2 - 5) / 5) * 100

        TrendAnalysisResponse trends = analyticsV1Service.getTrendsAndInsights(testUser);
        assertNotNull(trends);
        assertEquals("IMPROVING", trends.getDailyTrend()); // emissions decreased from 5 to 2
    }

    @Test
    public void testCategoryBreakdown() {
        ActivityLog log1 = ActivityLog.builder()
                .user(testUser)
                .category(Category.TRANSPORT)
                .activityType("Car Travel")
                .quantity(5.0)
                .unit("km")
                .emissionFactor(0.2)
                .carbonEmission(1.0)
                .logDate(LocalDate.now())
                .build();
        activityLogRepository.save(log1);

        ActivityLog log2 = ActivityLog.builder()
                .user(testUser)
                .category(Category.ELECTRICITY)
                .activityType("Grid Electricity")
                .quantity(6.0)
                .unit("kWh")
                .emissionFactor(0.5)
                .carbonEmission(3.0)
                .logDate(LocalDate.now())
                .build();
        activityLogRepository.save(log2);

        List<CategoryBreakdownResponse> breakdown = analyticsV1Service.getCategoryBreakdown(testUser);
        assertNotNull(breakdown);
        assertFalse(breakdown.isEmpty());
        
        CategoryBreakdownResponse trans = breakdown.stream()
                .filter(b -> b.getCategory().equals("TRANSPORT")).findFirst().orElse(null);
        assertNotNull(trans);
        assertEquals(1.0, trans.getEmissionValue());
        assertEquals(25.0, trans.getPercentageContribution()); // 1 / 4 * 100
    }

    @Test
    public void testBenchmarking() {
        ActivityLog log1 = ActivityLog.builder()
                .user(testUser)
                .category(Category.TRANSPORT)
                .activityType("Car Travel")
                .quantity(10.0)
                .unit("km")
                .emissionFactor(0.2)
                .carbonEmission(2.0)
                .logDate(LocalDate.now())
                .build();
        activityLogRepository.save(log1);

        BenchmarkingResponse bench = analyticsV1Service.getBenchmarking(testUser);
        assertNotNull(bench);
        assertTrue(bench.getYourEmissions() > 0);
        assertTrue(bench.getPlatformAverage() > 0);
        assertNotNull(bench.getComparisonInsight());
    }

    @Test
    public void testAdminV1Dashboard() {
        AdminDashboardV1Response stats = adminV1Service.getAdminDashboardStats();
        assertNotNull(stats);
        assertTrue(stats.getTotalUsers() > 0);
    }

    @Test
    public void testDateRangeAnalyticsSummaries() {
        // Ensure active factor is setup
        EmissionFactor factor = emissionFactorRepository.findByCategoryAndActivityTypeAndActiveTrue(Category.TRANSPORT, "Car Travel")
                .orElseGet(() -> emissionFactorRepository.save(
                        EmissionFactor.builder()
                                .category(Category.TRANSPORT)
                                .activityType("Car Travel")
                                .unit("km")
                                .factor(0.2)
                                .active(true)
                                .build()
                ));

        ActivityLogRequest request = new ActivityLogRequest();
        request.setCategory(Category.TRANSPORT);
        request.setActivityType("Car Travel");
        request.setQuantity(50.0); // 50 * 0.2 = 10kg
        request.setLogDate(LocalDate.now());

        // Logging activity via Service should automatically calculate Daily/Weekly/Monthly summaries
        ActivityLog logged = activityService.logActivity(request, testUser);
        assertNotNull(logged.getId());

        // Assert summaries exist
        List<DailyCarbonSummary> dailyList = dailyRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(testUser.getId(), LocalDate.now(), LocalDate.now());
        assertEquals(1, dailyList.size());
        double expectedEmissions = logged.getCarbonEmission();
        assertEquals(expectedEmissions, dailyList.get(0).getOverallTotal());
        assertEquals(1, dailyList.get(0).getActivityCount());

        // Test DateRange Query
        DateRangeAnalyticsResponse range = analyticsService.getDateRangeAnalytics(testUser, LocalDate.now().minusDays(5), LocalDate.now());
        assertNotNull(range);
        assertEquals(expectedEmissions, range.getTotalEmissions());
        assertEquals(expectedEmissions, range.getTransportTotal());
        assertEquals(0.0, range.getElectricityTotal());
        assertTrue(range.getAverageDailyEmissions() > 0);
        assertEquals(LocalDate.now().toString(), range.getHighestEmissionDay());
    }
}
