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
    private AuditLogService auditLogService;

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
                .status(GoalStatus.ACTIVE)
                .build();

        Goal savedGoal = goalRepository.save(goal);

        // Audit log
        auditLogService.log(user, "CREATE_GOAL", "Goal", savedGoal.getId(), "Created goal: " + title);

        // Send Notification
        notificationService.createNotification(
                user,
                "Goal Created: " + title,
                "Track your progress to achieve a " + targetReduction + "% carbon reduction by " + target,
                NotificationType.INFO
        );

        recalculateGoalProgress(savedGoal);

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
        auditLogService.log(user, "DELETE_GOAL", "Goal", id, "Deleted goal: " + goal.getGoalTitle());
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

        // 4. Update status
        if (progressPercentage >= 100.0) {
            goal.setStatus(GoalStatus.COMPLETED);
            goalRepository.save(goal);

            // Send notification
            notificationService.createNotification(
                    user,
                    "Goal Achieved! \uD83C\uDFC6",
                    "Congratulations! You completed your sustainability goal: " + goal.getGoalTitle(),
                    NotificationType.SUCCESS
            );
            auditLogService.log(user, "GOAL_COMPLETED", "Goal", goal.getId(), "Achieved goal: " + goal.getGoalTitle());
        } else if (today.isAfter(target)) {
            goal.setStatus(GoalStatus.FAILED);
            goalRepository.save(goal);

            notificationService.createNotification(
                    user,
                    "Goal Ended",
                    "Goal period ended. Better luck next time with: " + goal.getGoalTitle(),
                    NotificationType.WARNING
            );
            auditLogService.log(user, "GOAL_FAILED", "Goal", goal.getId(), "Failed goal: " + goal.getGoalTitle());
        } else {
            goalRepository.save(goal);
        }
    }
}
