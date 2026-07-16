package com.carbontracker.service;

import com.carbontracker.dto.ActivityLogRequest;
import com.carbontracker.entity.*;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.EmissionFactorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.*;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmissionCalculationTest {

    @InjectMocks
    private ActivityService activityService;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private EmissionFactorRepository emissionFactorRepository;

    @Mock
    private UserCarbonSummaryService summaryService;

    @Mock
    private GoalService goalService;

    @Mock
    private BadgeService badgeService;

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

    @ParameterizedTest
    @CsvSource({
            "TRANSPORT, Car Travel, 100.0, 0.18, 18.0",
            "TRANSPORT, Motorcycle, 50.0, 0.10, 5.0",
            "ELECTRICITY, Grid Electricity, 200.0, 0.85, 170.0",
            "FOOD, Beef Meal, 3.0, 8.00, 24.0"
    })
    void testCalculateEmissions_Parameterized(String categoryStr, String activityType, double quantity, double factorValue, double expectedEmission) {
        Category category = Category.valueOf(categoryStr);
        ActivityLogRequest request = new ActivityLogRequest();
        request.setCategory(category);
        request.setActivityType(activityType);
        request.setQuantity(quantity);
        request.setLogDate(LocalDate.now());

        EmissionFactor factor = EmissionFactor.builder()
                .category(category)
                .activityType(activityType)
                .unit("unit")
                .factor(factorValue)
                .active(true)
                .build();

        when(emissionFactorRepository.findByCategoryAndActivityTypeAndActiveTrue(category, activityType))
                .thenReturn(Optional.of(factor));

        when(activityLogRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ActivityLog result = activityService.logActivity(request, testUser);

        assertNotNull(result);
        assertEquals(expectedEmission, result.getCarbonEmission(), 0.001);
        assertEquals(factorValue, result.getEmissionFactor());
    }

    @Test
    void testCalculateEmissions_ZeroQuantity() {
        ActivityLogRequest request = new ActivityLogRequest();
        request.setCategory(Category.ELECTRICITY);
        request.setActivityType("Grid Electricity");
        request.setQuantity(0.0);
        request.setLogDate(LocalDate.now());

        EmissionFactor factor = EmissionFactor.builder()
                .category(Category.ELECTRICITY)
                .activityType("Grid Electricity")
                .unit("kWh")
                .factor(0.85)
                .active(true)
                .build();

        when(emissionFactorRepository.findByCategoryAndActivityTypeAndActiveTrue(Category.ELECTRICITY, "Grid Electricity"))
                .thenReturn(Optional.of(factor));

        when(activityLogRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ActivityLog result = activityService.logActivity(request, testUser);

        assertNotNull(result);
        assertEquals(0.0, result.getCarbonEmission());
    }

    @Test
    void testCalculateEmissions_NegativeQuantity_ThrowsException() {
        ActivityLogRequest request = new ActivityLogRequest();
        request.setCategory(Category.TRANSPORT);
        request.setActivityType("Car Travel");
        request.setQuantity(-10.5); // Negative
        request.setLogDate(LocalDate.now());

        assertThrows(IllegalArgumentException.class, () -> activityService.logActivity(request, testUser));
        verify(activityLogRepository, never()).save(any());
    }

    @Test
    void testCalculateEmissions_MissingFactor_ThrowsException() {
        ActivityLogRequest request = new ActivityLogRequest();
        request.setCategory(Category.TRANSPORT);
        request.setActivityType("Unknown Activity");
        request.setQuantity(10.0);
        request.setLogDate(LocalDate.now());

        when(emissionFactorRepository.findByCategoryAndActivityTypeAndActiveTrue(any(), any()))
                .thenReturn(Optional.empty()); // Factor not found

        assertThrows(IllegalArgumentException.class, () -> activityService.logActivity(request, testUser));
    }
}
