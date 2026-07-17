package com.carbontracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BenchmarkingResponse {
    private double yourEmissions;
    private double platformAverage;
    private double platformDifferencePercentage;
    
    private Double organizationAverage; // nullable
    private Double organizationDifferencePercentage; // nullable
    
    private double similarUsersAverage;
    private double similarUsersDifferencePercentage;
    
    private double percentileRanking;
    private String comparisonInsight;
}
