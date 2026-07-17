package com.carbontracker.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCategoryAnalyticsResponse {
    private Map<String, Long> activitiesPerCategory;
    private Map<String, Double> categoryEmissions;
    private Map<String, Double> categoryPercentages;
}
