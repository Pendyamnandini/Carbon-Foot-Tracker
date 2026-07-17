package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DateRangeAnalyticsResponse {
    private Double totalEmissions;
    private Double transportTotal;
    private Double electricityTotal;
    private Double foodTotal;
    private Double shoppingTotal;
    private Double averageDailyEmissions;
    private String highestEmissionDay;
    private Double highestEmissionValue;
    private String lowestEmissionDay;
    private Double lowestEmissionValue;
    private Integer activityCount;
    private Double sustainabilityScore;
    private String trend;
    private Double percentageChange;
}
