package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDashboardResponse {
    private List<RecommendationResponse> activeRecommendations;
    private List<RecommendationResponse> historyRecommendations;
    private int totalRecommendations;
    private int criticalRecommendations;
    private double potentialMonthlySavings;
    private double potentialAnnualSavings;
    private double sustainabilityScore;
    private String highestEmissionCategory;
    private double recommendationSuccessRate;
    private double goalProgressImpact;
    private List<String> personalizedInsights;
    private boolean insufficientData;
}
