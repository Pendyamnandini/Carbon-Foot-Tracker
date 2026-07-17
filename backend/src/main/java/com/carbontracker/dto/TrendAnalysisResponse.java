package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendAnalysisResponse {
    private String dailyTrend; // IMPROVING, STABLE, INCREASING
    private String weeklyTrend;
    private String monthlyTrend;
    private List<String> insights;
}
