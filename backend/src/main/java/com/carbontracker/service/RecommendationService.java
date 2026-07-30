package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private GoalService goalService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private AnalyticsService analyticsService;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private AchievementService achievementService;

    public RecommendationDashboardResponse getRecommendationDashboard(User user, LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), start, end);
        List<ActivityLog> allUserLogs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());

        // Check empty onboarding state
        if (allUserLogs.size() < 3) {
            return RecommendationDashboardResponse.builder()
                    .activeRecommendations(new ArrayList<>())
                    .historyRecommendations(new ArrayList<>())
                    .totalRecommendations(0)
                    .criticalRecommendations(0)
                    .potentialMonthlySavings(0.0)
                    .potentialAnnualSavings(0.0)
                    .sustainabilityScore(100.0)
                    .highestEmissionCategory("None")
                    .recommendationSuccessRate(0.0)
                    .goalProgressImpact(0.0)
                    .personalizedInsights(Arrays.asList("Log at least 3 activities to enable personalized recommendations."))
                    .insufficientData(true)
                    .build();
        }

        // 1. Generate/Refresh active recommendations
        refreshRecommendationsForPeriod(user, logs);

        // 2. Query recommendations from DB
        List<Recommendation> allRecs = recommendationRepository.findByUserId(user.getId());

        // Calculate potential savings for active recommendations
        List<RecommendationResponse> activeResponseList = new ArrayList<>();
        List<RecommendationResponse> historyResponseList = new ArrayList<>();

        double potentialMonthly = 0.0;
        int criticalCount = 0;

        for (Recommendation r : allRecs) {
            RecommendationResponse resp = mapToResponse(r, user, logs);
            if ("IN_PROGRESS".equalsIgnoreCase(r.getStatus())) {
                activeResponseList.add(resp);
                potentialMonthly += resp.getEstimatedMonthlySavings();
                if ("Critical".equalsIgnoreCase(resp.getImpact())) {
                    criticalCount++;
                }
            } else {
                historyResponseList.add(resp);
            }
        }

        // Sort active recommendations by impact (Critical > High > Medium > Low)
        activeResponseList.sort(Comparator.comparingInt(this::getImpactPriorityValue).reversed());

        // Highest Emission Category
        Map<Category, Double> catEmissions = new EnumMap<>(Category.class);
        for (Category cat : Category.values()) {
            catEmissions.put(cat, 0.0);
        }
        for (ActivityLog l : logs) {
            catEmissions.put(l.getCategory(), catEmissions.getOrDefault(l.getCategory(), 0.0) + l.getCarbonEmission());
        }
        Category highestCat = catEmissions.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(Category.TRANSPORT);

        double totalEmissions = logs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        double highestCatVal = catEmissions.getOrDefault(highestCat, 0.0);
        double highestCatPct = totalEmissions > 0 ? (highestCatVal / totalEmissions) * 100.0 : 0.0;

        // Sustainability Score
        long daysCount = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        double completedSavings = getCompletedMonthlySavings(user);
        double dailySavings = completedSavings / 30.0;
        double adjustedEmissions = Math.max(0.0, totalEmissions - dailySavings * daysCount);
        double sustainabilityScore = Math.max(0.0, Math.min(100.0, 100.0 - (adjustedEmissions / (5.0 * daysCount)) * 10.0));

        // Recommendation Success Rate
        long completedCount = allRecs.stream().filter(r -> "COMPLETED".equalsIgnoreCase(r.getStatus())).count();
        long ignoredCount = allRecs.stream().filter(r -> "NOT_INTERESTED".equalsIgnoreCase(r.getStatus()) || "IGNORED".equalsIgnoreCase(r.getStatus())).count();
        double successRate = (completedCount + ignoredCount) > 0 ? ((double) completedCount / (completedCount + ignoredCount)) * 100.0 : 0.0;

        // Goal Progress Impact
        double goalImpact = activeResponseList.stream().mapToDouble(RecommendationResponse::getCarbonReductionPercentage).sum();

        // Personalized Insights
        List<String> insights = new ArrayList<>();
        insights.add("Your largest carbon source is " + highestCat.name().substring(0,1).toUpperCase() + highestCat.name().substring(1).toLowerCase() + ".");
        insights.add(highestCat.name().substring(0,1).toUpperCase() + highestCat.name().substring(1).toLowerCase() + " contributes " + String.format("%.1f", highestCatPct) + "% of your emissions.");
        
        if (highestCat == Category.TRANSPORT) {
            insights.add("Switching two weekly trips to public transport could reduce approximately 10 kg CO₂ every month.");
        } else if (highestCat == Category.ELECTRICITY) {
            insights.add("Reducing standby power and switching to LEDs can improve your score by up to 5 points.");
        } else if (highestCat == Category.FOOD) {
            insights.add("Replacing beef meals with poultry or veggie options can cut food footprint by 40%.");
        } else {
            insights.add("Practicing mindful shopping and cool-off periods helps reduce shopping footprint.");
        }

        return RecommendationDashboardResponse.builder()
                .activeRecommendations(activeResponseList)
                .historyRecommendations(historyResponseList)
                .totalRecommendations(activeResponseList.size())
                .criticalRecommendations(criticalCount)
                .potentialMonthlySavings(round(potentialMonthly))
                .potentialAnnualSavings(round(potentialMonthly * 12.0))
                .sustainabilityScore(round(sustainabilityScore))
                .highestEmissionCategory(highestCat.name())
                .recommendationSuccessRate(round(successRate))
                .goalProgressImpact(round(goalImpact))
                .personalizedInsights(insights)
                .insufficientData(false)
                .build();
    }

    @Transactional
    public void updateRecommendationStatus(Long id, String status, User user) {
        Recommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found"));
        if (!rec.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied to this recommendation");
        }

        String oldStatus = rec.getStatus();
        rec.setStatus(status.toUpperCase());
        if ("REMIND_ME_LATER".equalsIgnoreCase(status)) {
            rec.setRemindAt(LocalDateTime.now().plusDays(3));
        } else {
            rec.setRemindAt(null);
        }
        recommendationRepository.save(rec);

        // Sync summaries and goals if status changed from/to COMPLETED
        if ("COMPLETED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(oldStatus)) {
            if (analyticsService != null) {
                analyticsService.updateSummariesForUserAndDate(user, LocalDate.now());
            }
            if (goalService != null) {
                goalService.recalculateGoalsForUser(user);
            }
            if (badgeService != null) {
                badgeService.checkAndAwardBadges(user);
            }

            if ("COMPLETED".equalsIgnoreCase(status) && !"COMPLETED".equalsIgnoreCase(oldStatus)) {
                if (achievementService != null) {
                    achievementService.awardPoints(user, 30, "Completed recommendation: " + rec.getTitle());
                    achievementService.checkAndAwardAchievements(user);
                }
            }
        }
    }

    @Transactional
    public List<RecommendationResponse> generateRecommendations(User user) {
        // Fallback for V1 GET compatibility
        RecommendationDashboardResponse dashboard = getRecommendationDashboard(user, null, null);
        return dashboard.getActiveRecommendations();
    }

    @Transactional
    public List<RecommendationResponse> getSavedRecommendations(User user) {
        List<Recommendation> stored = recommendationRepository.findByUserId(user.getId());
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), thirtyDaysAgo, LocalDate.now());
        return stored.stream()
                .map(r -> mapToResponse(r, user, logs))
                .collect(Collectors.toList());
    }

    @Transactional
    public void refreshRecommendations(User user) {
        LocalDate start = LocalDate.now().minusDays(30);
        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), start, LocalDate.now());
        refreshRecommendationsForPeriod(user, logs);
    }

    @Transactional
    public void refreshRecommendationsForPeriod(User user, List<ActivityLog> logs) {
        List<RecommendationTemplate> templates = getRecommendationTemplates();
        List<Recommendation> existing = recommendationRepository.findByUserId(user.getId());
        Map<String, Recommendation> existingMap = existing.stream()
                .collect(Collectors.toMap(r -> r.getTitle() + ":" + r.getCategory(), r -> r, (r1, r2) -> r1));

        Set<String> newlyGeneratedKeys = new HashSet<>();

        for (RecommendationTemplate temp : templates) {
            if (isTemplateApplicable(temp, logs)) {
                String key = temp.title + ":" + temp.category;
                newlyGeneratedKeys.add(key);

                if (existingMap.containsKey(key)) {
                    Recommendation rec = existingMap.get(key);
                    rec.setGeneratedAt(LocalDate.now());
                    recommendationRepository.save(rec);
                } else {
                    Recommendation rec = Recommendation.builder()
                            .user(user)
                            .title(temp.title)
                            .message(temp.description)
                            .category(temp.category)
                            .status("IN_PROGRESS")
                            .generatedAt(LocalDate.now())
                            .build();
                    recommendationRepository.save(rec);
                }
            }
        }

        // Clean up or archive obsolete IN_PROGRESS recommendations
        for (Recommendation r : existing) {
            String key = r.getTitle() + ":" + r.getCategory();
            if (!newlyGeneratedKeys.contains(key) && "IN_PROGRESS".equalsIgnoreCase(r.getStatus())) {
                recommendationRepository.delete(r);
            }
        }
    }

    public double getCompletedMonthlySavings(User user) {
        if (recommendationRepository == null) return 0.0;
        List<Recommendation> completed = recommendationRepository.findByUserIdAndStatus(user.getId(), "COMPLETED");
        if (completed.isEmpty()) {
            return 0.0;
        }
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<ActivityLog> logs30Days = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), thirtyDaysAgo, LocalDate.now());

        return completed.stream()
                .mapToDouble(r -> calculateSavings(r.getTitle(), user, logs30Days))
                .sum();
    }

    public double calculateSavings(String title, User user, List<ActivityLog> logs) {
        double transportEmissions = logs.stream().filter(l -> l.getCategory() == Category.TRANSPORT).mapToDouble(ActivityLog::getCarbonEmission).sum();
        double electricityEmissions = logs.stream().filter(l -> l.getCategory() == Category.ELECTRICITY).mapToDouble(ActivityLog::getCarbonEmission).sum();
        double foodEmissions = logs.stream().filter(l -> l.getCategory() == Category.FOOD).mapToDouble(ActivityLog::getCarbonEmission).sum();
        double shoppingEmissions = logs.stream().filter(l -> l.getCategory() == Category.SHOPPING).mapToDouble(ActivityLog::getCarbonEmission).sum();

        double carEmissions = logs.stream().filter(l -> l.getCategory() == Category.TRANSPORT && l.getActivityType().toLowerCase().contains("car")).mapToDouble(ActivityLog::getCarbonEmission).sum();
        double beefEmissions = logs.stream().filter(l -> l.getCategory() == Category.FOOD && l.getActivityType().toLowerCase().contains("beef")).mapToDouble(ActivityLog::getCarbonEmission).sum();

        switch (title) {
            case "Reduce personal car usage":
                return carEmissions > 0 ? carEmissions * 0.15 : 12.0;
            case "Use public transport 2–3 days per week":
                return carEmissions > 0 ? carEmissions * 0.25 : 25.0;
            case "Walk or cycle for short distances":
                return transportEmissions > 0 ? transportEmissions * 0.05 : 5.0;
            case "Combine multiple errands into one trip":
                return transportEmissions > 0 ? transportEmissions * 0.08 : 8.0;
            case "Prefer electric vehicles where possible":
                return transportEmissions > 0 ? transportEmissions * 0.35 : 40.0;

            case "Switch to LED bulbs":
                return electricityEmissions > 0 ? electricityEmissions * 0.10 : 4.0;
            case "Turn off appliances when idle":
                return electricityEmissions > 0 ? electricityEmissions * 0.08 : 5.0;
            case "Use energy-efficient appliances":
                return electricityEmissions > 0 ? electricityEmissions * 0.15 : 10.0;
            case "Reduce AC usage":
                return electricityEmissions > 0 ? electricityEmissions * 0.20 : 14.0;
            case "Shift heavy appliance usage to efficient hours":
                return electricityEmissions > 0 ? electricityEmissions * 0.12 : 8.0;

            case "Reduce beef consumption":
                return beefEmissions > 0 ? beefEmissions * 0.40 : 20.0;
            case "Increase vegetarian meals":
                return foodEmissions > 0 ? foodEmissions * 0.25 : 15.0;
            case "Buy local produce":
                return foodEmissions > 0 ? foodEmissions * 0.10 : 6.0;
            case "Reduce food waste":
                return foodEmissions > 0 ? foodEmissions * 0.15 : 8.0;

            case "Buy durable products":
                return shoppingEmissions > 0 ? shoppingEmissions * 0.15 : 10.0;
            case "Reduce unnecessary purchases":
                return shoppingEmissions > 0 ? shoppingEmissions * 0.25 : 18.0;
            case "Purchase eco-friendly products":
                return shoppingEmissions > 0 ? shoppingEmissions * 0.12 : 9.0;
            case "Reuse and recycle items":
                return shoppingEmissions > 0 ? shoppingEmissions * 0.20 : 12.0;
            default:
                return 10.0;
        }
    }

    private RecommendationResponse mapToResponse(Recommendation r, User user, List<ActivityLog> logs) {
        double monthlySavings = calculateSavings(r.getTitle(), user, logs);
        double totalEmissions = logs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        double pctReduction = totalEmissions > 0 ? (monthlySavings / totalEmissions) * 100.0 : 0.0;

        double catEmissions = logs.stream()
                .filter(l -> l.getCategory().name().equalsIgnoreCase(r.getCategory()))
                .mapToDouble(ActivityLog::getCarbonEmission)
                .sum();

        String difficulty = getDifficulty(r.getTitle());
        String impact = getImpact(monthlySavings);
        String confidence = logs.size() > 5 ? "High" : "Medium";
        String tip = getSustainabilityTip(r.getTitle());
        String explanation = getExplanation(r.getTitle(), monthlySavings, catEmissions);

        return RecommendationResponse.builder()
                .id(r.getId())
                .title(r.getTitle())
                .message(r.getMessage())
                .category(r.getCategory())
                .status(r.getStatus())
                .currentEmissions(round(catEmissions))
                .estimatedMonthlySavings(round(monthlySavings))
                .estimatedAnnualSavings(round(monthlySavings * 12.0))
                .carbonReductionPercentage(round(pctReduction))
                .difficulty(difficulty)
                .impact(impact)
                .confidence(confidence)
                .sustainabilityTip(tip)
                .explanation(explanation)
                .build();
    }

    private boolean isTemplateApplicable(RecommendationTemplate temp, List<ActivityLog> logs) {
        if ("Reduce personal car usage".equals(temp.title) || "Use public transport 2–3 days per week".equals(temp.title)) {
            return logs.stream().anyMatch(l -> l.getCategory() == Category.TRANSPORT && l.getActivityType().toLowerCase().contains("car"));
        }
        if ("Reduce beef consumption".equals(temp.title)) {
            return logs.stream().anyMatch(l -> l.getCategory() == Category.FOOD && l.getActivityType().toLowerCase().contains("beef"));
        }
        if ("Reduce AC usage".equals(temp.title)) {
            return logs.stream().anyMatch(l -> l.getCategory() == Category.ELECTRICITY && l.getCarbonEmission() > 0);
        }
        return true;
    }

    private int getImpactPriorityValue(RecommendationResponse r) {
        switch (r.getImpact()) {
            case "Critical": return 4;
            case "High": return 3;
            case "Medium": return 2;
            default: return 1;
        }
    }

    private String getDifficulty(String title) {
        if ("Prefer electric vehicles where possible".equals(title) || "Use energy-efficient appliances".equals(title) || "Reduce beef consumption".equals(title)) {
            return "High";
        }
        if ("Use public transport 2–3 days per week".equals(title) || "Reduce AC usage".equals(title) || "Buy durable products".equals(title) || "Reuse and recycle items".equals(title)) {
            return "Medium";
        }
        return "Easy";
    }

    private String getImpact(double savings) {
        if (savings > 30.0) return "Critical";
        if (savings > 15.0) return "High";
        if (savings > 5.0) return "Medium";
        return "Low";
    }

    private String getSustainabilityTip(String title) {
        switch (title) {
            case "Reduce personal car usage":
            case "Use public transport 2–3 days per week":
                return "Keeping tires inflated improves fuel economy by 3%.";
            case "Walk or cycle for short distances":
                return "Active transport burns calories, not carbon!";
            case "Switch to LED bulbs":
                return "LEDs use 80% less energy than regular lightbulbs.";
            case "Turn off appliances when idle":
                return "Standby power accounts for 10% of electric bills.";
            case "Reduce beef consumption":
                return "Beef has a carbon footprint 30x larger than tofu.";
            case "Reduce unnecessary purchases":
                return "Implementing a 48-hour cooling-off period saves carbon and money.";
            default:
                return "Small lifestyle adjustments lead to massive platform-wide eco improvements.";
        }
    }

    private String getExplanation(String title, double savings, double catEmissions) {
        return "Based on your carbon footprint, this recommendation can save up to " + String.format("%.1f", savings) + " kg CO₂ monthly. Your current emissions in this category stand at " + String.format("%.1f", catEmissions) + " kg CO₂. Implementing this action will optimize your resource consumption and lower your overall sustainability footprint.";
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }

    private List<RecommendationTemplate> getRecommendationTemplates() {
        List<RecommendationTemplate> list = new ArrayList<>();
        list.add(new RecommendationTemplate("Reduce personal Car usage", "Reduce personal car travel by using carpool or active transport.", "TRANSPORT"));
        list.add(new RecommendationTemplate("Use public transport 2–3 days per week", "Substitute weekly car commutes with public transit options.", "TRANSPORT"));
        list.add(new RecommendationTemplate("Walk or cycle for short distances", "Walk or bicycle for neighborly trips under 3km.", "TRANSPORT"));
        list.add(new RecommendationTemplate("Combine multiple errands into one trip", "Consolidate your vehicle errands into one planned trip.", "TRANSPORT"));
        list.add(new RecommendationTemplate("Prefer electric vehicles where possible", "Choose electric ridesharing or look into buying an EV/hybrid.", "TRANSPORT"));

        list.add(new RecommendationTemplate("Switch to LED bulbs", "Replace standard lightbulbs with energy-star LED lightbulbs.", "ELECTRICITY"));
        list.add(new RecommendationTemplate("Turn off appliances when idle", "Unplug electronics and shut down computers when not in use.", "ELECTRICITY"));
        list.add(new RecommendationTemplate("Use energy-efficient appliances", "Ensure household appliances have 5-star energy labels.", "ELECTRICITY"));
        list.add(new RecommendationTemplate("Reduce AC usage", "Adjust AC by 2 degrees warmer or reduce run time daily.", "ELECTRICITY"));
        list.add(new RecommendationTemplate("Shift heavy appliance usage to efficient hours", "Wash laundry during utility off-peak grid hours.", "ELECTRICITY"));

        list.add(new RecommendationTemplate("Reduce beef consumption", "Substitute beef meals with poultry or vegetarian proteins.", "FOOD"));
        list.add(new RecommendationTemplate("Increase vegetarian meals", "Eat purely plant-based meals at least 2 days a week.", "FOOD"));
        list.add(new RecommendationTemplate("Buy local produce", "Support organic farmer markets to eliminate food mile transport.", "FOOD"));
        list.add(new RecommendationTemplate("Reduce food waste", "Plan grocery portions, reuse leftovers, and compost waste.", "FOOD"));

        list.add(new RecommendationTemplate("Buy durable products", "Choose higher-quality, long-lasting products instead of cheap plastics.", "SHOPPING"));
        list.add(new RecommendationTemplate("Reduce unnecessary purchases", "Refrain from impulse buying by waiting 48 hours prior to purchases.", "SHOPPING"));
        list.add(new RecommendationTemplate("Purchase eco-friendly products", "Prefer items manufactured from recycled material and eco certifications.", "SHOPPING"));
        list.add(new RecommendationTemplate("Reuse and recycle items", "Repair garments or electronics instead of discarding them.", "SHOPPING"));
        return list;
    }

    private static class RecommendationTemplate {
        String title;
        String description;
        String category;

        RecommendationTemplate(String title, String description, String category) {
            this.title = title;
            this.description = description;
            this.category = category;
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
