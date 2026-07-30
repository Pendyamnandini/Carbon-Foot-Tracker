package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private EmailService emailService;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private RecommendationService recommendationService;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private AchievementService achievementService;

    public List<Goal> getGoalsForUser(User user) {
        return goalRepository.findByUserId(user.getId());
    }

    @Transactional
    public Goal createGoal(User user, String title, double targetReduction, LocalDate start, LocalDate target) {
        if (target.isBefore(start)) {
            throw new IllegalArgumentException("Target date must be after start date");
        }
        if (targetReduction <= 0 || targetReduction > 100) {
            throw new IllegalArgumentException("Target reduction must be between 1% and 100%");
        }

        Goal goal = Goal.builder()
                .user(user)
                .goalTitle(title)
                .targetReductionPercentage(targetReduction)
                .startDate(start)
                .targetDate(target)
                .currentProgress(0.0)
                .expectedProgress(0.0)
                .variance(0.0)
                .trackStatus("ON_TRACK")
                .status(GoalStatus.ACTIVE)
                .build();

        Goal savedGoal = goalRepository.save(goal);

        // Audit log
        auditLogService.log(user, "CREATE_GOAL", "Goal", savedGoal.getId(), "Created goal: " + title);
        auditLogService.logActivity(user, "CREATE", "Goal Creation", "Created goal: " + title, "Goals", null, null);

        // Send Notification
        notificationService.createNotification(
                user,
                "Goal Created: " + title,
                "Track your progress to achieve a " + targetReduction + "% carbon reduction by " + target,
                NotificationType.INFO
        );

        recalculateGoalProgress(savedGoal);

        if (recommendationService != null) {
            recommendationService.refreshRecommendations(user);
        }

        return savedGoal;
    }

    @Transactional
    public void deleteGoal(Long id, User user) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied to this goal");
        }

        goalRepository.delete(goal);
        if (auditLogService != null) {
            auditLogService.log(user, "DELETE_GOAL", "Goal", id, "Deleted goal: " + goal.getGoalTitle());
            auditLogService.logActivity(user, "DELETE", "Goal Deletion", "Deleted goal: " + goal.getGoalTitle(), "Goals", null, null);
        }

        if (recommendationService != null) {
            recommendationService.refreshRecommendations(user);
        }
    }

    @Transactional
    public void recalculateGoalsForUser(User user) {
        List<Goal> activeGoals = goalRepository.findByUserId(user.getId());
        for (Goal goal : activeGoals) {
            recalculateGoalProgress(goal);
        }
    }

    @Transactional
    public void recalculateGoalProgress(Goal goal) {
        if (goal.getStatus() == GoalStatus.COMPLETED || goal.getStatus() == GoalStatus.FAILED) {
            return; // Goal is already settled
        }

        User user = goal.getUser();
        LocalDate start = goal.getStartDate();
        LocalDate target = goal.getTargetDate();
        LocalDate today = LocalDate.now();

        // 1. Calculate Baseline: average daily emission in the 30 days prior to start date
        LocalDate baselineStart = start.minusDays(30);
        List<ActivityLog> baselineLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), baselineStart, start.minusDays(1));
        
        double totalBaselineEmission = baselineLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        double dailyBaseline = baselineLogs.isEmpty() ? 25.0 : (totalBaselineEmission / 30.0); // Fallback daily baseline to 25kg CO2

        // 2. Calculate Current Performance: average daily emission from start date to today (or target date, whichever is earlier)
        LocalDate performanceEnd = today.isBefore(target) ? today : target;
        long activeDays = ChronoUnit.DAYS.between(start, performanceEnd) + 1;
        if (activeDays <= 0) activeDays = 1;

        List<ActivityLog> activeLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), start, performanceEnd);
        double dailyActive;
        if (activeLogs.isEmpty()) {
            dailyActive = dailyBaseline;
        } else {
            double totalActiveEmission = activeLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
            dailyActive = totalActiveEmission / activeDays;
        }
        double completedSavings = 0.0;
        if (recommendationService != null) {
            completedSavings = recommendationService.getCompletedMonthlySavings(user);
        }
        double dailySavings = completedSavings / 30.0;
        dailyActive = Math.max(0.0, dailyActive - dailySavings);

        // 3. Reduction achieved percentage
        double reductionAchieved = 0.0;
        if (dailyBaseline > 0) {
            reductionAchieved = ((dailyBaseline - dailyActive) / dailyBaseline) * 100.0;
        }

        // Progress percentage relative to target reduction (0% to 100%)
        double progressPercentage = 0.0;
        if (goal.getTargetReductionPercentage() > 0) {
            progressPercentage = (reductionAchieved / goal.getTargetReductionPercentage()) * 100.0;
        }
        progressPercentage = Math.min(100.0, Math.max(0.0, progressPercentage));

        goal.setCurrentProgress(progressPercentage);

        // Calculate expected progress, variance, and track status
        long totalGoalDays = ChronoUnit.DAYS.between(start, target) + 1;
        long elapsedDays = ChronoUnit.DAYS.between(start, today) + 1;
        if (elapsedDays <= 0) elapsedDays = 1;
        if (totalGoalDays <= 0) totalGoalDays = 1;

        double expectedProgress = ((double) elapsedDays / totalGoalDays) * 100.0;
        expectedProgress = Math.min(100.0, Math.max(0.0, expectedProgress));
        double variance = progressPercentage - expectedProgress;

        String trackStatus = "ON_TRACK";
        if (variance < -15.0) {
            trackStatus = "BEHIND_SCHEDULE";
        } else if (variance >= 10.0) {
            trackStatus = "AHEAD_OF_SCHEDULE";
        }

        String oldTrackStatus = goal.getTrackStatus();
        goal.setExpectedProgress(expectedProgress);
        goal.setVariance(variance);
        goal.setTrackStatus(trackStatus);

        // Publish GoalProgressEvent
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new com.carbontracker.event.GoalProgressEvent(this, goal));
        }

        // 4. Update status
        if (progressPercentage >= 100.0) {
            boolean wasCompleted = (goal.getStatus() == GoalStatus.COMPLETED);
            goal.setStatus(GoalStatus.COMPLETED);
            goalRepository.save(goal);

            if (!wasCompleted) {
                if (achievementService != null) {
                    achievementService.awardPoints(user, 50, "Completed carbon goal: " + goal.getGoalTitle());
                    achievementService.checkAndAwardAchievements(user);
                }
            }

            // Send notification & email
            if (notificationService != null) {
                notificationService.createNotification(
                        user,
                        "Goal Achieved! \uD83C\uDFC6",
                        "Congratulations! You completed your sustainability goal: " + goal.getGoalTitle(),
                        NotificationType.SUCCESS
                );
            }
            if (emailService != null) {
                emailService.sendGoalAchievementEmail(user.getEmail(), goal.getGoalTitle());
            }
            if (auditLogService != null) {
                auditLogService.log(user, "GOAL_COMPLETED", "Goal", goal.getId(), "Achieved goal: " + goal.getGoalTitle());
                auditLogService.logActivity(user, "UPDATE", "Goal Completion", "Completed goal: " + goal.getGoalTitle(), "Goals", null, null);
            }

            // Publish GoalCompletedEvent
            if (eventPublisher != null) {
                eventPublisher.publishEvent(new com.carbontracker.event.GoalCompletedEvent(this, user));
            }
        } else if (today.isAfter(target)) {
            goal.setStatus(GoalStatus.FAILED);
            goalRepository.save(goal);

            if (notificationService != null) {
                notificationService.createNotification(
                        user,
                        "Goal Ended",
                        "Goal period ended. Better luck next time with: " + goal.getGoalTitle(),
                        NotificationType.WARNING
                );
            }
            if (auditLogService != null) {
                auditLogService.log(user, "GOAL_FAILED", "Goal", goal.getId(), "Failed goal: " + goal.getGoalTitle());
                auditLogService.logActivity(user, "UPDATE", "Goal Period Ended", "Goal period ended: " + goal.getGoalTitle(), "Goals", null, null);
            }
        } else {
            goalRepository.save(goal);

            // Send tracking warnings/encouragements on status changes
            if (!trackStatus.equals(oldTrackStatus)) {
                if ("BEHIND_SCHEDULE".equals(trackStatus)) {
                    if (notificationService != null) {
                        notificationService.createNotification(
                                user,
                                "Goal Warning: Behind Schedule ⚠️",
                                "Your goal '" + goal.getGoalTitle() + "' is behind schedule. Make some eco adjustments to get back on track!",
                                NotificationType.WARNING
                        );
                    }
                    if (emailService != null) {
                        emailService.sendGoalStatusAlertEmail(user.getEmail(), goal.getGoalTitle(), false);
                    }
                } else if ("AHEAD_OF_SCHEDULE".equals(trackStatus)) {
                    if (notificationService != null) {
                        notificationService.createNotification(
                                user,
                                "Goal Update: Ahead of Schedule! 🚀",
                                "Great work! You are ahead of schedule for your goal: " + goal.getGoalTitle(),
                                NotificationType.SUCCESS
                        );
                    }
                    if (emailService != null) {
                        emailService.sendGoalStatusAlertEmail(user.getEmail(), goal.getGoalTitle(), true);
                    }
                }
            }
        }
    }

    @Autowired
    private com.carbontracker.repository.UserRepository userRepository;

    // Scheduled weekly goal recalculation Sunday at 5 AM
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 5 * * SUN")
    @Transactional
    public void weeklyGoalRecalculation() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                recalculateGoalsForUser(user);
            } catch (Exception e) {
                System.err.println("Weekly goal recalculation failed for user " + user.getId() + ": " + e.getMessage());
            }
        }
    }
}
