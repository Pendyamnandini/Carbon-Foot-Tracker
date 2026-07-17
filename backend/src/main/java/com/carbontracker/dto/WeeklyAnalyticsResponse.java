package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyAnalyticsResponse {
    private double currentWeekEmissions;
    private double previousWeekEmissions;
    private double percentageChange;
    private List<WeeklyEmissionTrend> trend;
    private List<WeeklySummaryItem> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WeeklyEmissionTrend {
        private String weekLabel;
        private double emissions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WeeklySummaryItem {
        private int weekNumber;
        private int year;
        private double overallTotal;
        private double transport;
        private double electricity;
        private double food;
        private double shopping;
        private int activityCount;
        private double sustainabilityScore;
    }
}
