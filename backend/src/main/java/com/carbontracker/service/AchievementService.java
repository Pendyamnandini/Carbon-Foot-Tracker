package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class AchievementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    @Lazy
    private BadgeService badgeService;

    @Autowired
    @Lazy
    private RecommendationService recommendationService;

    public List<Achievement> getAchievementsForUser(User user) {
        return achievementRepository.findByUserIdOrderByAchievedAtDesc(user.getId());
    }

    public List<Certificate> getCertificatesForUser(User user) {
        return certificateRepository.findByUserId(user.getId());
    }

    @Transactional
    public void awardPoints(User user, int points, String reason) {
        int oldPoints = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
        int newPoints = oldPoints + points;
        user.setRewardPoints(newPoints);

        int oldLevel = user.getLevel() != null ? user.getLevel() : 1;
        int newLevel = (newPoints / 100) + 1;
        user.setLevel(newLevel);

        userRepository.save(user);

        if (auditLogService != null) {
            auditLogService.log(user, "EARN_POINTS", "User", user.getId(), "Earned " + points + " points for: " + reason);
        }

        if (notificationService != null) {
            notificationService.createNotification(
                    user,
                    "Reward Points Earned! 🪙",
                    "You earned " + points + " points for: " + reason,
                    NotificationType.REWARD
            );
        }

        if (newLevel > oldLevel) {
            if (notificationService != null) {
                notificationService.createNotification(
                        user,
                        "Level Up! 🎉",
                        "Congratulations! You reached Level " + newLevel + "!",
                        NotificationType.INFO
                );
            }
            if (emailService != null) {
                emailService.sendMilestoneAchievementEmail(user.getEmail(), "Level Up!", "Congratulations! You reached Level " + newLevel + " on CarbonTracker!");
            }
        }
    }

    @Transactional
    public void awardAchievementIfEligible(User user, String title, String description, int points, String badgeName, boolean certEligible) {
        Optional<Achievement> existing = achievementRepository.findByUserIdAndTitle(user.getId(), title);
        if (existing.isEmpty()) {
            Achievement achievement = Achievement.builder()
                    .user(user)
                    .title(title)
                    .description(description)
                    .rewardPoints(points)
                    .badgeName(badgeName)
                    .certificateEligible(certEligible)
                    .build();
            achievementRepository.save(achievement);

            awardPoints(user, points, "Achievement Unlocked: " + title);

            if (notificationService != null) {
                notificationService.createNotification(
                        user,
                        "Achievement Unlocked: " + title,
                        description,
                        NotificationType.ACHIEVEMENT
                );
            }

            if (emailService != null) {
                emailService.sendMilestoneAchievementEmail(user.getEmail(), "Achievement Unlocked: " + title, description);
            }

            if (certEligible) {
                generateCertificateIfEligible(user, title);
            }
        }
    }

    @Transactional
    public void generateCertificateIfEligible(User user, String achievementTitle) {
        String certTitle = "";
        String certDesc = "";

        if (achievementTitle.equals("Eco Warrior Milestone")) {
            certTitle = "Eco Warrior Certificate";
            certDesc = "Awarded for outstanding dedication in setting and completing 3 carbon reduction goals.";
        } else if (achievementTitle.equals("Carbon Reduction Elite 50kg")) {
            certTitle = "Carbon Reduction Excellence Certificate";
            certDesc = "Awarded in recognition of reducing overall carbon footprint by 50 kg CO₂.";
        } else if (achievementTitle.equals("Carbon Champion Elite 100kg")) {
            certTitle = "Sustainability Champion Certificate";
            certDesc = "Awarded in recognition of exceptional green contributions and reducing carbon footprint by 100 kg CO₂.";
        } else if (achievementTitle.equals("Recommendation Master Milestone")) {
            certTitle = "Green Ambassador Certificate";
            certDesc = "Awarded for actively implementing 5 personalized green recommendations.";
        } else {
            return;
        }

        Optional<Certificate> existing = certificateRepository.findByUserIdAndTitle(user.getId(), certTitle);
        if (existing.isEmpty()) {
            String uniqueId = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String verificationCode = UUID.randomUUID().toString().substring(0, 12).toUpperCase();

            Certificate certificate = Certificate.builder()
                    .user(user)
                    .certificateId(uniqueId)
                    .title(certTitle)
                    .description(certDesc)
                    .dateIssued(LocalDate.now())
                    .verificationCode(verificationCode)
                    .organizationName("CarbonTracker Global Coalition")
                    .digitalSignature("SIGNED_SECURE_SHA256_CARBONTRACKER_DIRECTOR")
                    .platformLogo("/assets/images/platform_logo_green.png")
                    .build();
            certificateRepository.save(certificate);

            awardPoints(user, 100, "Received Certificate: " + certTitle);

            if (notificationService != null) {
                notificationService.createNotification(
                        user,
                        "Digital Certificate Issued! 📜",
                        "You have earned the " + certTitle + "! Check your profile to view/download.",
                        NotificationType.CERTIFICATE
                );
            }

            if (emailService != null) {
                emailService.sendMilestoneAchievementEmail(user.getEmail(), "Digital Certificate Generated: " + certTitle, "We are proud to award you the " + certTitle + " for: " + certDesc + " Certificate ID: " + uniqueId);
            }
        }
    }

    @Transactional
    public void checkAndAwardAchievements(User user) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        List<Goal> goals = goalRepository.findByUserId(user.getId());
        List<Recommendation> recs = recommendationRepository.findByUserIdAndStatus(user.getId(), "COMPLETED");

        // 1. Green Beginner Starter Achievement
        if (!logs.isEmpty()) {
            awardAchievementIfEligible(user, "Green Beginner Starter", "Logged your first activity on the platform.", 20, "Green Beginner", false);
        }

        // 2. First Goal Completed Achievement
        long completedGoals = goals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
        if (completedGoals >= 1) {
            awardAchievementIfEligible(user, "First Goal Completed", "Successfully reached 100% on your first active goal.", 50, "First Goal Achieved", false);
        }

        // 3. Eco Warrior Milestone Achievement (3 goals)
        if (completedGoals >= 3) {
            awardAchievementIfEligible(user, "Eco Warrior Milestone", "Setting and successfully completing 3 carbon reduction goals.", 100, "Eco Warrior", true);
        }

        // 4. Recommendation Master Milestone Achievement (5 recommendations)
        if (recs.size() >= 5) {
            awardAchievementIfEligible(user, "Recommendation Master Milestone", "Completing 5 personalized green recommendations.", 100, "Recommendation Master", true);
        }

        // 5. Saved CO2 Achievements (using dynamic savings engine)
        double totalSaved = 0.0;
        if (recommendationService != null) {
            totalSaved = recommendationService.getCompletedMonthlySavings(user);
        }
        for (Goal g : goals) {
            if (g.getStatus() == GoalStatus.COMPLETED) {
                LocalDate start = g.getStartDate();
                LocalDate target = g.getTargetDate();
                long days = java.time.temporal.ChronoUnit.DAYS.between(start, target) + 1;
                LocalDate baselineStart = start.minusDays(30);
                List<ActivityLog> baselineLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), baselineStart, start.minusDays(1));
                double dailyBaseline = baselineLogs.isEmpty() ? 25.0 : (baselineLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum() / 30.0);
                List<ActivityLog> activeLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), start, target);
                double totalActive = activeLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                double saved = (dailyBaseline * days) - totalActive;
                if (saved > 0) {
                    totalSaved += saved;
                }
            }
        }

        if (totalSaved >= 10.0) {
            awardAchievementIfEligible(user, "Eco Saver Starter 10kg", "Saved 10 kg of carbon emissions.", 50, "Eco Saver 10 kg", false);
        }
        if (totalSaved >= 25.0) {
            awardAchievementIfEligible(user, "Eco Saver Achiever 25kg", "Saved 25 kg of carbon emissions.", 80, "Eco Saver 25 kg", false);
        }
        if (totalSaved >= 50.0) {
            awardAchievementIfEligible(user, "Carbon Reduction Elite 50kg", "Saved 50 kg of carbon emissions.", 150, "Eco Saver 50 kg", true);
        }
        if (totalSaved >= 100.0) {
            awardAchievementIfEligible(user, "Carbon Champion Elite 100kg", "Saved 100 kg of carbon emissions.", 200, "Carbon Champion", true);
        }

        // Trigger dynamic badges check too
        if (badgeService != null) {
            badgeService.checkAndAwardBadges(user);
        }
    }
}
