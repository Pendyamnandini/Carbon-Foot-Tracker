package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodAnalyticsResponse {
    private double totalEmissions;
    private double sustainabilityScore;
    
    // Category Breakdown
    private double transportTotal;
    private double electricityTotal;
    private double foodTotal;
    private double shoppingTotal;

    // Previous Period Comparison
    private double previousPeriodEmissions;
    private double percentageChange;
    private String trendLabel; // e.g. "IMPROVING", "INCREASING", "STABLE"

    // Category Trend Data
    private List<TrendPoint> trend; 
    
    // Personalized Recommendations
    private List<ReductionTipResponse> recommendations;

    // Benchmarking Metrics
    private BenchmarkingResponse benchmarking;

    // Period Narrative Insights
    private List<String> insights;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendPoint {
        private String label;
        private double emissions;
    }
}
