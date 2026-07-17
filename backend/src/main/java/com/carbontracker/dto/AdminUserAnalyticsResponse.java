package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserAnalyticsResponse {
    private long totalUsers;
    private long activeUsers;
    private long newUsersThisWeek;
    private long newUsersThisMonth;
    private long inactiveUsers;
    
    private List<AdminDashboardV1Response.UserEmissionRank> lowestEmissionUsers;
    private List<AdminDashboardV1Response.UserEmissionRank> highestEmissionUsers;
    private List<AdminDashboardV1Response.UserEmissionRank> mostActiveUsers;
    private List<AdminDashboardV1Response.UserEmissionRank> highestSustainabilityScores;
}
