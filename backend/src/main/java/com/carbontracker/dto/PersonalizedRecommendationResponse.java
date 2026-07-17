package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalizedRecommendationResponse {
    private List<ActivityEmission> topActivities;
    private String highestCategory;
    private String mostFrequentActivity;
    private List<ReductionTipResponse> recommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityEmission {
        private String activityType;
        private double emission;
    }
}
