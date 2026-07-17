package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    public List<UserBadge> getUserBadges(User user) {
        return userBadgeRepository.findByUserId(user.getId());
    }

    @Transactional
    public void checkAndAwardBadges(User user) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        List<Goal> goals = goalRepository.findByUserId(user.getId());

        // 1. 7-Day Streak
        Set<LocalDate> uniqueDates = new TreeSet<>(Comparator.reverseOrder());
        for (ActivityLog log : logs) {
            uniqueDates.add(log.getLogDate());
        }
        int consecutiveDays = 0;
        LocalDate current = null;
        boolean has7DayStreak = false;
        for (LocalDate date : uniqueDates) {
            if (current == null) {
                current = date;
                consecutiveDays = 1;
            } else {
                if (date.equals(current.minusDays(1))) {
                    consecutiveDays++;
                    current = date;
                } else if (!date.equals(current)) {
                    consecutiveDays = 1;
                    current = date;
                }
            }
            if (consecutiveDays >= 7) {
                has7DayStreak = true;
                break;
            }
        }
        if (has7DayStreak) {
            awardBadgeIfEligible(user, "7-Day Streak", "You logged activities for 7 consecutive days!", "CONSECUTIVE_DAYS >= 7");
        }

        // 2. First Goal Achieved
        long completedGoals = goals.stream()
                .filter(g -> g.getStatus() == GoalStatus.COMPLETED)
                .count();
        if (completedGoals >= 1) {
            awardBadgeIfEligible(user, "First Goal Achieved", "You completed your first carbon reduction goal!", "GOALS_COMPLETED >= 1");
        }

        // 3. Eco Saver 10kg / 25kg / 50kg
        double totalSaved = 0.0;
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
            awardBadgeIfEligible(user, "Eco Saver 10kg", "You saved 10 kg of carbon emissions!", "CARBON_SAVED >= 10");
        }
        if (totalSaved >= 25.0) {
            awardBadgeIfEligible(user, "Eco Saver 25kg", "You saved 25 kg of carbon emissions!", "CARBON_SAVED >= 25");
        }
        if (totalSaved >= 50.0) {
            awardBadgeIfEligible(user, "Eco Saver 50kg", "You saved 50 kg of carbon emissions!", "CARBON_SAVED >= 50");
        }
    }

    private void awardBadgeIfEligible(User user, String badgeName, String message, String criteria) {
        Badge badge = badgeRepository.findByBadgeName(badgeName).orElseGet(() -> {
            Badge newBadge = Badge.builder()
                    .badgeName(badgeName)
                    .description(message)
                    .criteria(criteria)
                    .build();
            return badgeRepository.save(newBadge);
        });

        if (!userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
            UserBadge userBadge = UserBadge.builder()
                    .user(user)
                    .badge(badge)
                    .build();
            userBadgeRepository.save(userBadge);

            // Send Achievement Notification
            notificationService.createNotification(
                    user,
                    "Badge Earned: " + badgeName,
                    message,
                    NotificationType.ACHIEVEMENT
            );

            // Audit log
            auditLogService.log(
                    user,
                    "AWARD_BADGE",
                    "Badge",
                    badge.getId(),
                    "Awarded badge: " + badgeName
            );
            auditLogService.logActivity(user, "CREATE", "Badge Earned", "Earned badge: " + badgeName, "Profile", null, null);
        }
    }

    @Autowired
    private UserRepository userRepository;

    // Scheduled badge evaluation daily at 3 AM
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void dailyBadgeEvaluation() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                checkAndAwardBadges(user);
            } catch (Exception e) {
                System.err.println("Daily badge evaluation failed for user " + user.getId() + ": " + e.getMessage());
            }
        }
    }
}
