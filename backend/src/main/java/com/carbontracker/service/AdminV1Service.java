package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminV1Service {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    public AdminDashboardV1Response getAdminDashboardStats() {
        // 1. User Stats
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(User::isActive).count();
        long inactiveUsers = totalUsers - activeUsers;

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        long newWeekUsers = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(sevenDaysAgo))
                .count();
        long newMonthUsers = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();

        // 2. Activity & Emission Stats
        List<ActivityLog> allActivities = activityLogRepository.findAll();
        long totalActivities = allActivities.size();
        double totalEmissions = allActivities.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();

        // Group by category counts & values
        Map<String, Long> activitiesPerCategory = new HashMap<>();
        Map<String, Double> categoryEmissions = new HashMap<>();
        for (Category cat : Category.values()) {
            activitiesPerCategory.put(cat.name(), 0L);
            categoryEmissions.put(cat.name(), 0.0);
        }
        for (ActivityLog log : allActivities) {
            String cat = log.getCategory().name();
            activitiesPerCategory.put(cat, activitiesPerCategory.getOrDefault(cat, 0L) + 1);
            categoryEmissions.put(cat, categoryEmissions.getOrDefault(cat, 0.0) + log.getCarbonEmission());
        }

        Map<String, Double> categoryPercentages = new HashMap<>();
        for (String cat : categoryEmissions.keySet()) {
            double catVal = categoryEmissions.get(cat);
            double pct = totalEmissions == 0 ? 0.0 : (catVal / totalEmissions) * 100.0;
            categoryPercentages.put(cat, round(pct));
            categoryEmissions.put(cat, round(catVal));
        }

        // Daily charts (last 7 days)
        List<AdminDashboardV1Response.TimeValue> activitiesPerDay = new ArrayList<>();
        List<AdminDashboardV1Response.TimeValue> dailyEmissions = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long actCount = allActivities.stream().filter(a -> a.getLogDate().equals(d)).count();
            double emSum = allActivities.stream().filter(a -> a.getLogDate().equals(d)).mapToDouble(ActivityLog::getCarbonEmission).sum();
            activitiesPerDay.add(new AdminDashboardV1Response.TimeValue(d.toString(), (double) actCount));
            dailyEmissions.add(new AdminDashboardV1Response.TimeValue(d.toString(), round(emSum)));
        }

        // Weekly charts (last 4 weeks)
        List<AdminDashboardV1Response.TimeValue> activitiesPerWeek = new ArrayList<>();
        List<AdminDashboardV1Response.TimeValue> weeklyEmissions = new ArrayList<>();
        WeekFields weekFields = WeekFields.ISO;
        LocalDate startOfWeek = today.with(java.time.DayOfWeek.MONDAY);
        for (int i = 3; i >= 0; i--) {
            LocalDate start = startOfWeek.minusWeeks(i);
            LocalDate end = start.plusDays(6);
            long actCount = allActivities.stream().filter(a -> !a.getLogDate().isBefore(start) && !a.getLogDate().isAfter(end)).count();
            double emSum = allActivities.stream().filter(a -> !a.getLogDate().isBefore(start) && !a.getLogDate().isAfter(end)).mapToDouble(ActivityLog::getCarbonEmission).sum();
            String label = "Wk " + start.get(weekFields.weekOfWeekBasedYear());
            activitiesPerWeek.add(new AdminDashboardV1Response.TimeValue(label, (double) actCount));
            weeklyEmissions.add(new AdminDashboardV1Response.TimeValue(label, round(emSum)));
        }

        // Monthly charts (last 6 months)
        List<AdminDashboardV1Response.TimeValue> activitiesPerMonth = new ArrayList<>();
        List<AdminDashboardV1Response.TimeValue> monthlyEmissions = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate mStart = today.withDayOfMonth(1).minusMonths(i);
            LocalDate mEnd = mStart.withDayOfMonth(mStart.lengthOfMonth());
            long actCount = allActivities.stream().filter(a -> !a.getLogDate().isBefore(mStart) && !a.getLogDate().isAfter(mEnd)).count();
            double emSum = allActivities.stream().filter(a -> !a.getLogDate().isBefore(mStart) && !a.getLogDate().isAfter(mEnd)).mapToDouble(ActivityLog::getCarbonEmission).sum();
            String label = mStart.getMonth().name().substring(0,3) + " " + mStart.getYear();
            activitiesPerMonth.add(new AdminDashboardV1Response.TimeValue(label, (double) actCount));
            monthlyEmissions.add(new AdminDashboardV1Response.TimeValue(label, round(emSum)));
        }

        // 3. Goal Stats
        List<Goal> allGoals = goalRepository.findAll();
        long goalsCreated = allGoals.size();
        long goalsCompleted = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
        long goalsInProgress = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.ACTIVE).count();
        double successRate = goalsCreated == 0 ? 0.0 : ((double) goalsCompleted / goalsCreated) * 100.0;

        // 4. Badge Stats
        List<UserBadge> allUserBadges = userBadgeRepository.findAll();
        Map<String, Long> badgeDistribution = allUserBadges.stream()
                .collect(Collectors.groupingBy(ub -> ub.getBadge().getBadgeName(), Collectors.counting()));
        
        // Populate missing badges with 0
        List<Badge> dbBadges = badgeRepository.findAll();
        for (Badge b : dbBadges) {
            badgeDistribution.putIfAbsent(b.getBadgeName(), 0L);
        }

        String mostEarned = badgeDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
        String leastEarned = badgeDistribution.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        // 5. Feedback Stats
        List<Feedback> allFeedback = feedbackRepository.findAll();
        long totalFeedback = allFeedback.size();
        long openFeedback = allFeedback.stream().filter(f -> f.getStatus() == FeedbackStatus.OPEN).count();
        long resolvedFeedback = allFeedback.stream().filter(f -> f.getStatus() == FeedbackStatus.RESOLVED).count();

        // 6. User Rankings (Top 10)
        double platAvg = activeUsers == 0 ? 0.0 : totalEmissions / activeUsers;
        Map<Long, Double> userEmSum = allActivities.stream()
                .collect(Collectors.groupingBy(a -> a.getUser().getId(), Collectors.summingDouble(ActivityLog::getCarbonEmission)));
        Map<Long, Integer> userActCount = allActivities.stream()
                .collect(Collectors.groupingBy(a -> a.getUser().getId(), Collectors.summingInt(a -> 1)));

        List<AdminDashboardV1Response.UserEmissionRank> userRankings = new ArrayList<>();
        for (User u : allUsers) {
            if (u.getRole() == Role.ADMIN) continue; // exclude admin
            double em = userEmSum.getOrDefault(u.getId(), 0.0);
            int count = userActCount.getOrDefault(u.getId(), 0);
            long badgesCount = allUserBadges.stream().filter(ub -> ub.getUser().getId().equals(u.getId())).count();
            long compGoals = allGoals.stream().filter(g -> g.getUser().getId().equals(u.getId()) && g.getStatus() == GoalStatus.COMPLETED).count();

            // Calculate Sustainability Score
            double score = 50.0 + (badgesCount * 10.0) + (compGoals * 15.0);
            if (platAvg > 0) {
                score -= (em / platAvg) * 20.0;
            }
            score = Math.max(0.0, Math.min(100.0, score));

            userRankings.add(AdminDashboardV1Response.UserEmissionRank.builder()
                    .userId(u.getId())
                    .fullName(u.getFullName())
                    .email(u.getEmail())
                    .emissions(round(em))
                    .activityCount(count)
                    .sustainabilityScore(round(score))
                    .build());
        }

        List<AdminDashboardV1Response.UserEmissionRank> lowestEmissionUsers = userRankings.stream()
                .sorted(Comparator.comparingDouble(AdminDashboardV1Response.UserEmissionRank::getEmissions))
                .limit(10)
                .collect(Collectors.toList());

        List<AdminDashboardV1Response.UserEmissionRank> highestEmissionUsers = userRankings.stream()
                .sorted(Comparator.comparingDouble(AdminDashboardV1Response.UserEmissionRank::getEmissions).reversed())
                .limit(10)
                .collect(Collectors.toList());

        List<AdminDashboardV1Response.UserEmissionRank> mostActiveUsers = userRankings.stream()
                .sorted(Comparator.comparingInt(AdminDashboardV1Response.UserEmissionRank::getActivityCount).reversed())
                .limit(10)
                .collect(Collectors.toList());

        List<AdminDashboardV1Response.UserEmissionRank> highestSustainabilityScores = userRankings.stream()
                .sorted(Comparator.comparingDouble(AdminDashboardV1Response.UserEmissionRank::getSustainabilityScore).reversed())
                .limit(10)
                .collect(Collectors.toList());

        return AdminDashboardV1Response.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .newUsersThisWeek(newWeekUsers)
                .newUsersThisMonth(newMonthUsers)
                .totalActivities(totalActivities)
                .activitiesPerCategory(activitiesPerCategory)
                .activitiesPerDay(activitiesPerDay)
                .activitiesPerWeek(activitiesPerWeek)
                .activitiesPerMonth(activitiesPerMonth)
                .totalPlatformEmissions(round(totalEmissions))
                .dailyEmissions(dailyEmissions)
                .weeklyEmissions(weeklyEmissions)
                .monthlyEmissions(monthlyEmissions)
                .categoryEmissions(categoryEmissions)
                .categoryPercentages(categoryPercentages)
                .goalsCreated(goalsCreated)
                .goalsCompleted(goalsCompleted)
                .goalsInProgress(goalsInProgress)
                .goalSuccessRate(round(successRate))
                .badgeDistribution(badgeDistribution)
                .mostEarnedBadge(mostEarned)
                .leastEarnedBadge(leastEarned)
                .totalFeedback(totalFeedback)
                .openFeedback(openFeedback)
                .resolvedFeedback(resolvedFeedback)
                .lowestEmissionUsers(lowestEmissionUsers)
                .highestEmissionUsers(highestEmissionUsers)
                .mostActiveUsers(mostActiveUsers)
                .highestSustainabilityScores(highestSustainabilityScores)
                .build();
    }

    public AdminUserAnalyticsResponse getUserAnalytics() {
        AdminDashboardV1Response fullStats = getAdminDashboardStats();
        return AdminUserAnalyticsResponse.builder()
                .totalUsers(fullStats.getTotalUsers())
                .activeUsers(fullStats.getActiveUsers())
                .newUsersThisWeek(fullStats.getNewUsersThisWeek())
                .newUsersThisMonth(fullStats.getNewUsersThisMonth())
                .inactiveUsers(fullStats.getInactiveUsers())
                .lowestEmissionUsers(fullStats.getLowestEmissionUsers())
                .highestEmissionUsers(fullStats.getHighestEmissionUsers())
                .mostActiveUsers(fullStats.getMostActiveUsers())
                .highestSustainabilityScores(fullStats.getHighestSustainabilityScores())
                .build();
    }

    public AdminEmissionAnalyticsResponse getEmissionAnalytics() {
        AdminDashboardV1Response fullStats = getAdminDashboardStats();
        return AdminEmissionAnalyticsResponse.builder()
                .totalPlatformEmissions(fullStats.getTotalPlatformEmissions())
                .dailyEmissions(fullStats.getDailyEmissions())
                .weeklyEmissions(fullStats.getWeeklyEmissions())
                .monthlyEmissions(fullStats.getMonthlyEmissions())
                .build();
    }

    public AdminCategoryAnalyticsResponse getCategoryAnalytics() {
        AdminDashboardV1Response fullStats = getAdminDashboardStats();
        return AdminCategoryAnalyticsResponse.builder()
                .activitiesPerCategory(fullStats.getActivitiesPerCategory())
                .categoryEmissions(fullStats.getCategoryEmissions())
                .categoryPercentages(fullStats.getCategoryPercentages())
                .build();
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
