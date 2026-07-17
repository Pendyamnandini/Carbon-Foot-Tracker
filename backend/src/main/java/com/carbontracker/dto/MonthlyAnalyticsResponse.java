package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyAnalyticsResponse {
    private double currentMonthEmissions;
    private double previousMonthEmissions;
    private double percentageChange;
    private List<MonthlyEmissionTrend> trend;
    private List<MonthlySummaryItem> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyEmissionTrend {
        private String monthLabel;
        private double emissions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlySummaryItem {
        private int month;
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
