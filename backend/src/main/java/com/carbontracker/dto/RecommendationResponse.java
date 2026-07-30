package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResponse {
    private Long id;
    private String title;
    private String message;
    private String category;
    private String status;
    private double currentEmissions;
    private double estimatedMonthlySavings;
    private double estimatedAnnualSavings;
    private double carbonReductionPercentage;
    private String difficulty;
    private String impact;
    private String confidence;
    private String sustainabilityTip;
    private String explanation;
}
