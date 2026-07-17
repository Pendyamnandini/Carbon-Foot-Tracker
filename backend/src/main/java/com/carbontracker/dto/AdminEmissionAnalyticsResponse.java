package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminEmissionAnalyticsResponse {
    private double totalPlatformEmissions;
    private List<AdminDashboardV1Response.TimeValue> dailyEmissions;
    private List<AdminDashboardV1Response.TimeValue> weeklyEmissions;
    private List<AdminDashboardV1Response.TimeValue> monthlyEmissions;
}
