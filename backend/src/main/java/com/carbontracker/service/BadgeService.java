package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

        // 1. Green Starter: LOG_COUNT >= 1
        if (!logs.isEmpty()) {
            awardBadgeIfEligible(user, "Green Starter", "You logged your first activity!");
        }

        // 2. Sustainability Champion: CATEGORIES_LOGGED >= 4
        Set<Category> uniqueCategories = new HashSet<>();
        for (ActivityLog log : logs) {
            uniqueCategories.add(log.getCategory());
        }
        if (uniqueCategories.size() >= 4) {
            awardBadgeIfEligible(user, "Sustainability Champion", "You logged activities in all 4 sustainability categories!");
        }

        // 3. Eco Warrior: GOALS_COMPLETED >= 3
        long completedGoals = goals.stream()
                .filter(g -> g.getStatus() == GoalStatus.COMPLETED)
                .count();
        if (completedGoals >= 3) {
            awardBadgeIfEligible(user, "Eco Warrior", "You successfully completed 3 carbon reduction goals!");
        }

        // 4. Carbon Reducer (triggered during goal updates/summaries - evaluated here too)
        // If they have completed at least one goal with 20% reduction target
        boolean hasHighReductionGoal = goals.stream()
                .anyMatch(g -> g.getStatus() == GoalStatus.COMPLETED && g.getTargetReductionPercentage() >= 20.0);
        if (hasHighReductionGoal) {
            awardBadgeIfEligible(user, "Carbon Reducer", "You achieved a goal with a carbon reduction of 20% or more!");
        }
    }

    private void awardBadgeIfEligible(User user, String badgeName, String message) {
        badgeRepository.findByBadgeName(badgeName).ifPresent(badge -> {
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
            }
        });
    }
}
