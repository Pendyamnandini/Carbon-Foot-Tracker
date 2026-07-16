package com.carbontracker.service;

import com.carbontracker.dto.RecommendationResponse;
import com.carbontracker.entity.*;
import com.carbontracker.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public List<RecommendationResponse> generateRecommendations(User user) {
        List<RecommendationResponse> recommendations = new ArrayList<>();
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);

        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(
                user.getId(), sevenDaysAgo, LocalDate.now()
        );

        double transportTotal = 0.0;
        double electricityTotal = 0.0;
        double foodTotal = 0.0;
        double shoppingTotal = 0.0;
        boolean hasBeefMeal = false;

        for (ActivityLog log : logs) {
            switch (log.getCategory()) {
                case TRANSPORT -> transportTotal += log.getCarbonEmission();
                case ELECTRICITY -> electricityTotal += log.getCarbonEmission();
                case FOOD -> {
                    foodTotal += log.getCarbonEmission();
                    if ("Beef Meal".equalsIgnoreCase(log.getActivityType())) {
                        hasBeefMeal = true;
                    }
                }
                case SHOPPING -> shoppingTotal += log.getCarbonEmission();
            }
        }

        // Rule-based logic
        if (transportTotal > 80.0) {
            recommendations.add(RecommendationResponse.builder()
                    .title("Optimize Commute Habits")
                    .message("Use public transportation twice a week. Carpooling or taking the train/metro cuts transit emissions substantially compared to single-occupancy driving.")
                    .category("TRANSPORT")
                    .build());
        }

        if (electricityTotal > 120.0) {
            recommendations.add(RecommendationResponse.builder()
                    .title("Switch to Energy Efficiency")
                    .message("Switch to energy-efficient appliances and LED lighting. Turn off unused equipment and consider smart thermostats to manage heating/cooling loads.")
                    .category("ELECTRICITY")
                    .build());
        }

        if (hasBeefMeal || foodTotal > 40.0) {
            recommendations.add(RecommendationResponse.builder()
                    .title("Try Plant-Based Alternatives")
                    .message("Reduce red meat consumption. Swapping beef or pork for chicken, fish, or vegetarian meals (tofu, beans, lentils) cuts food footprint by up to 60%.")
                    .category("FOOD")
                    .build());
        }

        if (shoppingTotal > 50.0) {
            recommendations.add(RecommendationResponse.builder()
                    .title("Adopt Circular Shopping")
                    .message("Slightly limit new purchases. Buy second-hand clothes, repair electronics when possible, and opt for high-durability items to reduce carbon lifecycle waste.")
                    .category("SHOPPING")
                    .build());
        }

        // Add standard fallback if they are doing very well
        if (recommendations.isEmpty()) {
            recommendations.add(RecommendationResponse.builder()
                    .title("Keep it Up!")
                    .message("Your emissions are outstandingly low this week. Challenge yourself by setting a new 15% reduction goal on the tracker.")
                    .category("GENERAL")
                    .build());
        }

        return recommendations;
    }
}
