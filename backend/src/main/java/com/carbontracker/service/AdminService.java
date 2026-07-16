package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private LeaderboardService leaderboardService;

    public AdminDashboardResponse getDashboardStatistics() {
        // User stats
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream().filter(User::isActive).count();
        
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long newUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(sevenDaysAgo))
                .count();

        // Activity stats
        List<ActivityLog> allActivities = activityLogRepository.findAll();
        long totalActivities = allActivities.size();
        long transport = allActivities.stream().filter(a -> a.getCategory() == Category.TRANSPORT).count();
        long electricity = allActivities.stream().filter(a -> a.getCategory() == Category.ELECTRICITY).count();
        long food = allActivities.stream().filter(a -> a.getCategory() == Category.FOOD).count();
        long shopping = allActivities.stream().filter(a -> a.getCategory() == Category.SHOPPING).count();

        // Platform Analytics
        double averageCarbonFootprint = 0.0;
        double totalEmission = allActivities.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        if (activeUsers > 0) {
            averageCarbonFootprint = totalEmission / activeUsers;
        }

        // Find highest and lowest users
        Map<String, Double> userEmissions = allActivities.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getUser().getFullName(),
                        Collectors.summingDouble(ActivityLog::getCarbonEmission)
                ));

        String highestUser = "N/A";
        double maxEmission = -1.0;
        String lowestUser = "N/A";
        double minEmission = Double.MAX_VALUE;

        for (Map.Entry<String, Double> entry : userEmissions.entrySet()) {
            if (entry.getValue() > maxEmission) {
                maxEmission = entry.getValue();
                highestUser = entry.getKey() + " (" + String.format("%.1f", maxEmission) + " kg)";
            }
            if (entry.getValue() < minEmission) {
                minEmission = entry.getValue();
                lowestUser = entry.getKey() + " (" + String.format("%.1f", minEmission) + " kg)";
            }
        }
        if (userEmissions.isEmpty()) {
            lowestUser = "N/A";
        }

        // Feedback stats
        List<Feedback> feedbacks = feedbackRepository.findAll();
        long totalFeedback = feedbacks.size();
        long pendingFeedback = feedbacks.stream().filter(f -> f.getStatus() == FeedbackStatus.OPEN).count();
        long resolvedFeedback = feedbacks.stream().filter(f -> f.getStatus() == FeedbackStatus.RESOLVED).count();

        // Leaderboard Top Users
        List<LeaderboardResponse> realTimeBoard = leaderboardService.getLeaderboard();
        List<AdminDashboardResponse.LeaderboardResponse> topUsers = realTimeBoard.stream()
                .limit(5)
                .map(r -> AdminDashboardResponse.LeaderboardResponse.builder()
                        .userId(r.getUserId())
                        .userName(r.getUserName())
                        .carbonEmission(r.getCarbonEmission())
                        .build())
                .collect(Collectors.toList());

        // Badge Distribution
        List<UserBadge> userBadges = userBadgeRepository.findAll();
        Map<String, Long> badgeDistribution = userBadges.stream()
                .collect(Collectors.groupingBy(
                        ub -> ub.getBadge().getBadgeName(),
                        Collectors.counting()
                ));

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .newUsers(newUsers)
                .totalActivities(totalActivities)
                .transportActivities(transport)
                .electricityActivities(electricity)
                .foodActivities(food)
                .shoppingActivities(shopping)
                .averageCarbonFootprint(averageCarbonFootprint)
                .highestFootprintUser(highestUser)
                .lowestFootprintUser(lowestUser)
                .totalFeedback(totalFeedback)
                .pendingFeedback(pendingFeedback)
                .resolvedFeedback(resolvedFeedback)
                .topUsers(topUsers)
                .badgeDistribution(badgeDistribution)
                .build();
    }
}
