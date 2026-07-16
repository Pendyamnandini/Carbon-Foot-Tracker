package com.carbontracker.service;

import com.carbontracker.dto.CarbonAggregationProjection;
import com.carbontracker.entity.*;
import com.carbontracker.event.ActivityLoggedEvent;
import com.carbontracker.event.GoalCompletedEvent;
import com.carbontracker.event.GoalProgressEvent;
import com.carbontracker.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
public class Milestone2FeaturesTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private GoalService goalService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private UserCarbonSummaryService summaryService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    private User testUser;

    @BeforeEach
    public void setup() {
        // Ensure test user exists
        testUser = userRepository.findByEmail("test_milestone2@carbontracker.com").orElseGet(() -> {
            User user = User.builder()
                    .fullName("Milestone Test User")
                    .email("test_milestone2@carbontracker.com")
                    .password("Password@123")
                    .role(Role.USER)
                    .active(true)
                    .build();
            return userRepository.save(user);
        });

        // Clear any old data for this user
        activityLogRepository.deleteAll(activityLogRepository.findByUserIdOrderByLogDateDesc(testUser.getId()));
        goalRepository.deleteAll(goalRepository.findByUserId(testUser.getId()));
        userBadgeRepository.deleteAll(userBadgeRepository.findByUserId(testUser.getId()));
    }

    @Test
    public void testJpqlAggregationQueries() {
        // Log a few activities
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

        ActivityLog log2 = ActivityLog.builder()
                .user(testUser)
                .category(Category.ELECTRICITY)
                .activityType("Grid Electricity")
                .quantity(50.0)
                .unit("kWh")
                .emissionFactor(0.5)
                .carbonEmission(25.0)
                .logDate(LocalDate.now().minusDays(2))
                .build();
        activityLogRepository.save(log2);

        // Test JPQL aggregates
        List<CarbonAggregationProjection> categoryTotals = activityLogRepository.findCategoryTotals(testUser.getId());
        assertFalse(categoryTotals.isEmpty());
        
        List<CarbonAggregationProjection> dailyTotals = activityLogRepository.findDailyFootprintTotals(testUser.getId());
        assertTrue(dailyTotals.size() >= 2);

        List<CarbonAggregationProjection> rangeTotals = activityLogRepository.findAggregatesByDateRange(
                testUser.getId(), LocalDate.now().minusDays(5), LocalDate.now()
        );
        assertTrue(rangeTotals.size() >= 2);
    }

    @Test
    public void testRecommendationEngine30Days() {
        // Log a high emission transport activity
        ActivityLog log = ActivityLog.builder()
                .user(testUser)
                .category(Category.TRANSPORT)
                .activityType("Car Travel")
                .quantity(100.0)
                .unit("km")
                .emissionFactor(0.2)
                .carbonEmission(20.0)
                .logDate(LocalDate.now().minusDays(5))
                .build();
        activityLogRepository.save(log);

        // Refresh recommendations
        recommendationService.refreshRecommendations(testUser);

        var recs = recommendationService.getSavedRecommendations(testUser);
        assertFalse(recs.isEmpty());
        assertTrue(recs.stream().anyMatch(r -> r.getTitle().contains("Car")));
    }

    @Test
    public void testGoalProjectionsAndAlerts() {
        LocalDate start = LocalDate.now().minusDays(10);
        LocalDate target = LocalDate.now().plusDays(20);

        Goal goal = goalService.createGoal(testUser, "Reduce Commute", 20.0, start, target);
        assertNotNull(goal.getId());

        // Recalculate
        goalService.recalculateGoalProgress(goal);

        // Assert properties
        assertTrue(goal.getExpectedProgress() > 0.0);
        assertNotNull(goal.getTrackStatus());
    }

    @Test
    public void testSpringEventsBadgeAward() {
        // Trigger streak badge eligibility
        for (int i = 0; i < 7; i++) {
            ActivityLog log = ActivityLog.builder()
                    .user(testUser)
                    .category(Category.FOOD)
                    .activityType("Vegetarian Meal")
                    .quantity(1.0)
                    .unit("meal")
                    .emissionFactor(0.5)
                    .carbonEmission(0.5)
                    .logDate(LocalDate.now().minusDays(i))
                    .build();
            activityLogRepository.save(log);
        }

        // Publish ActivityLoggedEvent
        eventPublisher.publishEvent(new ActivityLoggedEvent(this, testUser));

        // Check if badges were awarded via the listener
        List<UserBadge> badges = badgeService.getUserBadges(testUser);
        assertFalse(badges.isEmpty());
        assertTrue(badges.stream().anyMatch(ub -> ub.getBadge().getBadgeName().equals("7-Day Streak")));
    }

    @Test
    public void testScheduledJobsExecution() {
        assertDoesNotThrow(() -> summaryService.dailyUpdateSummaries());
        assertDoesNotThrow(() -> summaryService.weeklyRecalculateTotals());
        assertDoesNotThrow(() -> summaryService.monthlyGenerateHistoricalSummaries());
        assertDoesNotThrow(() -> badgeService.dailyBadgeEvaluation());
        assertDoesNotThrow(() -> recommendationService.dailyRecommendationRefresh());
    }
}
