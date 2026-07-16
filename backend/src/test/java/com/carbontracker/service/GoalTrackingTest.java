package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.GoalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GoalTrackingTest {

    @InjectMocks
    private GoalService goalService;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = User.builder().id(1L).fullName("Test User").email("test@example.com").build();
    }

    @Test
    void testCreateGoal_Success() {
        LocalDate start = LocalDate.now();
        LocalDate target = LocalDate.now().plusDays(15);
        
        when(goalRepository.save(any(Goal.class))).thenAnswer(invocation -> {
            Goal g = invocation.getArgument(0);
            g.setId(10L);
            return g;
        });

        Goal result = goalService.createGoal(testUser, "Reduce Food Waste", 15.0, start, target);

        assertNotNull(result);
        assertEquals("Reduce Food Waste", result.getGoalTitle());
        assertEquals(15.0, result.getTargetReductionPercentage());
        assertEquals(GoalStatus.ACTIVE, result.getStatus());
        verify(goalRepository, times(2)).save(any(Goal.class));
        verify(notificationService, times(1)).createNotification(any(), anyString(), anyString(), any());
    }

    @Test
    void testCreateGoal_InvalidDates() {
        LocalDate start = LocalDate.now();
        LocalDate target = LocalDate.now().minusDays(2); // target before start

        assertThrows(IllegalArgumentException.class, () -> goalService.createGoal(testUser, "Error Goal", 10.0, start, target));
    }

    @Test
    void testRecalculateGoalProgress_GoalCompleted() {
        LocalDate start = LocalDate.now().minusDays(5);
        LocalDate target = LocalDate.now().plusDays(5);

        Goal goal = Goal.builder()
                .id(1L)
                .user(testUser)
                .goalTitle("Save Energy")
                .targetReductionPercentage(10.0)
                .startDate(start)
                .targetDate(target)
                .status(GoalStatus.ACTIVE)
                .build();

        // Mock baseline logs: daily baseline sum is high (e.g. 50kg per day on average)
        List<ActivityLog> baselineLogs = new ArrayList<>();
        baselineLogs.add(ActivityLog.builder().carbonEmission(1500.0).build()); // 1500 / 30 = 50kg/day
        when(activityLogRepository.findByUserIdAndLogDateBetween(eq(testUser.getId()), any(LocalDate.class), eq(start.minusDays(1))))
                .thenReturn(baselineLogs);

        // Mock current performance logs: active daily average is low (e.g. 20kg per day on average)
        List<ActivityLog> activeLogs = new ArrayList<>();
        activeLogs.add(ActivityLog.builder().carbonEmission(100.0).build()); // 100 / 5 days = 20kg/day
        when(activityLogRepository.findByUserIdAndLogDateBetween(eq(testUser.getId()), eq(start), any(LocalDate.class)))
                .thenReturn(activeLogs);

        // Daily baseline = 50, Daily active = 20 -> reduction achieved = (50 - 20) / 50 * 100 = 60%.
        // Target reduction = 10% -> progress = 600% (capped at 100%) -> GoalStatus.COMPLETED

        goalService.recalculateGoalProgress(goal);

        assertEquals(100.0, goal.getCurrentProgress());
        assertEquals(GoalStatus.COMPLETED, goal.getStatus());
        verify(goalRepository, times(1)).save(goal);
    }
}
