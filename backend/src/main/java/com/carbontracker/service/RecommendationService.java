package com.carbontracker.service;

import com.carbontracker.dto.RecommendationResponse;
import com.carbontracker.entity.*;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.RecommendationRepository;
import com.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    public List<RecommendationResponse> generateRecommendations(User user) {
        return getSavedRecommendations(user);
    }

    @Transactional
    public List<RecommendationResponse> getSavedRecommendations(User user) {
        List<Recommendation> stored = recommendationRepository.findByUserId(user.getId());
        if (stored.isEmpty()) {
            refreshRecommendations(user);
            stored = recommendationRepository.findByUserId(user.getId());
        }

        return stored.stream()
                .map(r -> RecommendationResponse.builder()
                        .title(r.getTitle())
                        .message(r.getMessage())
                        .category(r.getCategory())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void refreshRecommendations(User user) {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(
                user.getId(), thirtyDaysAgo, LocalDate.now()
        );

        // Group by ActivityType and sum emissions
        Map<String, Double> emissionMap = new HashMap<>();
        for (ActivityLog log : logs) {
            String type = log.getActivityType() != null ? log.getActivityType() : "Unknown";
            emissionMap.put(type, emissionMap.getOrDefault(type, 0.0) + log.getCarbonEmission());
        }

        // Sort by emissions descending and find top 3
        List<Map.Entry<String, Double>> sortedActivities = emissionMap.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(3)
                .collect(Collectors.toList());

        List<RecommendationResponse> newTips = new ArrayList<>();
        for (Map.Entry<String, Double> entry : sortedActivities) {
            newTips.add(createTipForActivity(entry.getKey(), entry.getValue()));
        }

        // Standard Fallback Tip if they have less than 3 logged activities
        if (newTips.size() < 3) {
            newTips.add(new RecommendationResponse("Track More Activities",
                    "To generate highly personalized insights, log more transport, electricity, shopping, and food choices.", "GENERAL"));
        }

        // Fetch old recommendation titles to detect changes
        List<Recommendation> oldRecs = recommendationRepository.findByUserId(user.getId());
        Set<String> oldTitles = oldRecs.stream().map(Recommendation::getTitle).collect(Collectors.toSet());
        Set<String> newTitles = newTips.stream().map(RecommendationResponse::getTitle).collect(Collectors.toSet());

        boolean hasChanged = !oldTitles.equals(newTitles);

        if (hasChanged || oldRecs.isEmpty()) {
            recommendationRepository.deleteByUserId(user.getId());
            for (RecommendationResponse tip : newTips) {
                Recommendation rec = Recommendation.builder()
                        .user(user)
                        .title(tip.getTitle())
                        .message(tip.getMessage())
                        .category(tip.getCategory())
                        .generatedAt(LocalDate.now())
                        .build();
                recommendationRepository.save(rec);
            }

            if (!oldRecs.isEmpty()) {
                notificationService.createNotification(
                        user,
                        "New Reduction Tips! 💡",
                        "Based on your footprint over the last 30 days, your eco recommendations have been updated.",
                        NotificationType.INFO
                );
            }
        }
    }

    private RecommendationResponse createTipForActivity(String activityType, double emission) {
        String type = activityType.toLowerCase();
        if (type.contains("car")) {
            return new RecommendationResponse("Optimize Car Travel",
                    "Your car travel contributed " + String.format("%.1f", emission) + " kg CO2. Try ridesharing, walking/biking for short trips under 5km, or taking transit.", "TRANSPORT");
        } else if (type.contains("flight") || type.contains("plane")) {
            return new RecommendationResponse("Aviation Footprint Mitigation",
                    "Flights contributed " + String.format("%.1f", emission) + " kg CO2. Offset flight miles or choose high-speed rail options instead of flying.", "TRANSPORT");
        } else if (type.contains("bus") || type.contains("metro") || type.contains("train") || type.contains("transit")) {
            return new RecommendationResponse("Transit Choice",
                    "Public transit (" + String.format("%.1f", emission) + " kg CO2) is green. Walking or biking short commutes will eliminate transit footprint.", "TRANSPORT");
        } else if (type.contains("electricity") || type.contains("grid")) {
            return new RecommendationResponse("Grid Electricity Savings",
                    "Grid electricity usage contributed " + String.format("%.1f", emission) + " kg CO2. Unplug standby appliances, switch to LEDs, and wash clothes in cold water.", "ELECTRICITY");
        } else if (type.contains("solar") || type.contains("wind") || type.contains("renewable")) {
            return new RecommendationResponse("Promote Renewable Energy",
                    "Awesome clean energy use (" + String.format("%.1f", emission) + " kg CO2)! Share your solar metrics to expand local impact.", "ELECTRICITY");
        } else if (type.contains("beef") || type.contains("red meat")) {
            return new RecommendationResponse("Reduce Beef Intake",
                    "Beef meals contributed " + String.format("%.1f", emission) + " kg CO2. Substituting beef with plant proteins cuts footprint up to 80%.", "FOOD");
        } else if (type.contains("chicken") || type.contains("pork") || type.contains("meat")) {
            return new RecommendationResponse("Plant-Based Substitutes",
                    "Meat meals contributed " + String.format("%.1f", emission) + " kg CO2. Try designating a few meatless days each week.", "FOOD");
        } else if (type.contains("clothing") || type.contains("clothes") || type.contains("fashion")) {
            return new RecommendationResponse("Avoid Fast Fashion",
                    "Fashion items contributed " + String.format("%.1f", emission) + " kg CO2. Buy high-quality durable clothing, trade clothes, or buy second-hand.", "SHOPPING");
        } else if (type.contains("electronics") || type.contains("gadgets") || type.contains("phone")) {
            return new RecommendationResponse("Electronics Lifespan Extension",
                    "Electronics shopping contributed " + String.format("%.1f", emission) + " kg CO2. Extend your phone/laptop lifespan, repair, and recycle.", "SHOPPING");
        } else {
            return new RecommendationResponse("Reduce " + activityType + " Footprint",
                    "Logged activities for " + activityType + " contributed " + String.format("%.1f", emission) + " kg CO2. Keep logging and look for lower-emission options.", "GENERAL");
        }
    }

    // Refresh recommendations daily at 4 AM
    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void dailyRecommendationRefresh() {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            try {
                refreshRecommendations(u);
            } catch (Exception e) {
                System.err.println("Failed to refresh recommendations for user " + u.getId() + ": " + e.getMessage());
            }
        }
    }
}
