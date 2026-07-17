package com.carbontracker.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardV1Response {
    // User stats
    private long totalUsers;
    private long activeUsers;
    private long newUsersThisWeek;
    private long newUsersThisMonth;
    private long inactiveUsers;

    // Activity stats
    private long totalActivities;
    private Map<String, Long> activitiesPerCategory;
    private List<TimeValue> activitiesPerDay;
    private List<TimeValue> activitiesPerWeek;
    private List<TimeValue> activitiesPerMonth;

    // Emission stats
    private double totalPlatformEmissions;
    private List<TimeValue> dailyEmissions;
    private List<TimeValue> weeklyEmissions;
    private List<TimeValue> monthlyEmissions;

    // Category emissions
    private Map<String, Double> categoryEmissions;
    private Map<String, Double> categoryPercentages;

    // Goal stats
    private long goalsCreated;
    private long goalsCompleted;
    private long goalsInProgress;
    private double goalSuccessRate;

    // Badge stats
    private Map<String, Long> badgeDistribution;
    private String mostEarnedBadge;
    private String leastEarnedBadge;

    // Feedback stats
    private long totalFeedback;
    private long openFeedback;
    private long resolvedFeedback;

    // User lists (Top 10)
    private List<UserEmissionRank> lowestEmissionUsers;
    private List<UserEmissionRank> highestEmissionUsers;
    private List<UserEmissionRank> mostActiveUsers;
    private List<UserEmissionRank> highestSustainabilityScores;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeValue {
        private String timeLabel;
        private double value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserEmissionRank {
        private Long userId;
        private String fullName;
        private String email;
        private double emissions;
        private int activityCount;
        private double sustainabilityScore;
    }
}
