package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyAnalyticsResponse {
    private double todayEmissions;
    private double yesterdayEmissions;
    private double difference;
    private double percentageChange;
    private List<DailyEmissionTrend> trend;
    private List<DailySummaryItem> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyEmissionTrend {
        private String date;
        private double emissions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailySummaryItem {
        private String date;
        private double overallTotal;
        private double transport;
        private double electricity;
        private double food;
        private double shopping;
        private int activityCount;
        private double sustainabilityScore;
    }
}
