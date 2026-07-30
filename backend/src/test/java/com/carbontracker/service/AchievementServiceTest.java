package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AchievementServiceTest {

    @InjectMocks
    private AchievementService achievementService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private CertificateRepository certificateRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    @Mock
    private BadgeService badgeService;

    @Mock
    private RecommendationService recommendationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = User.builder()
                .id(1L)
                .fullName("Eco User")
                .email("eco@example.com")
                .rewardPoints(0)
                .level(1)
                .build();
    }

    @Test
    void testAwardPoints_LevelUp() {
        achievementService.awardPoints(testUser, 150, "Completed heavy task");

        assertEquals(150, testUser.getRewardPoints());
        assertEquals(2, testUser.getLevel()); // 150/100 + 1 = 2
        verify(userRepository, times(1)).save(testUser);
        verify(notificationService, times(1)).createNotification(eq(testUser), contains("Reward Points"), anyString(), eq(NotificationType.REWARD));
        verify(notificationService, times(1)).createNotification(eq(testUser), contains("Level Up"), anyString(), eq(NotificationType.INFO));
        verify(emailService, times(1)).sendMilestoneAchievementEmail(eq(testUser.getEmail()), anyString(), anyString());
    }

    @Test
    void testAwardAchievementIfEligible_New() {
        when(achievementRepository.findByUserIdAndTitle(testUser.getId(), "Eco Warrior Milestone"))
                .thenReturn(Optional.empty());

        achievementService.awardAchievementIfEligible(testUser, "Eco Warrior Milestone", "Awarded for goals completed", 100, "Eco Warrior", true);

        verify(achievementRepository, times(1)).save(any(Achievement.class));
        verify(notificationService, times(1)).createNotification(eq(testUser), contains("Achievement Unlocked"), anyString(), eq(NotificationType.ACHIEVEMENT));
    }

    @Test
    void testGenerateCertificateIfEligible_EcoWarrior() {
        when(certificateRepository.findByUserIdAndTitle(testUser.getId(), "Eco Warrior Certificate"))
                .thenReturn(Optional.empty());

        achievementService.generateCertificateIfEligible(testUser, "Eco Warrior Milestone");

        verify(certificateRepository, times(1)).save(any(Certificate.class));
        verify(notificationService, times(1)).createNotification(eq(testUser), contains("Digital Certificate Issued"), anyString(), eq(NotificationType.CERTIFICATE));
    }

    @Test
    void testCheckAndAwardAchievements_Beginner() {
        List<ActivityLog> logs = new ArrayList<>();
        logs.add(ActivityLog.builder().id(10L).build());
        when(activityLogRepository.findByUserIdOrderByLogDateDesc(testUser.getId())).thenReturn(logs);
        when(goalRepository.findByUserId(testUser.getId())).thenReturn(new ArrayList<>());
        when(recommendationRepository.findByUserIdAndStatus(testUser.getId(), "COMPLETED")).thenReturn(new ArrayList<>());

        when(achievementRepository.findByUserIdAndTitle(testUser.getId(), "Green Beginner Starter"))
                .thenReturn(Optional.empty());

        achievementService.checkAndAwardAchievements(testUser);

        verify(achievementRepository, times(1)).save(any(Achievement.class));
    }
}
