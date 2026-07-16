package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    // User Statistics
    private long totalUsers;
    private long activeUsers;
    private long newUsers;

    // Activity Statistics
    private long totalActivities;
    private long transportActivities;
    private long electricityActivities;
    private long foodActivities;
    private long shoppingActivities;

    // Platform Analytics
    private double averageCarbonFootprint;
    private String highestFootprintUser;
    private String lowestFootprintUser;

    // Feedback Analytics
    private long totalFeedback;
    private long pendingFeedback;
    private long resolvedFeedback;

    // Leaderboard & Badges
    private List<LeaderboardResponse> topUsers;
    private Map<String, Long> badgeDistribution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LeaderboardResponse {
        private Long userId;
        private String userName;
        private String email;
        private double carbonEmission;
    }
}
