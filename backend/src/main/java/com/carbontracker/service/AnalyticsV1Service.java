package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsV1Service {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private RecommendationService recommendationService;

    // --- DAILY EMISSION ANALYTICS ---
    public DailyAnalyticsResponse getDailyAnalytics(User user) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        double todayEmissions = sumEmissionsForDateRange(user.getId(), today, today);
        double yesterdayEmissions = sumEmissionsForDateRange(user.getId(), yesterday, yesterday);

        double pctChange = calculatePercentageChange(todayEmissions, yesterdayEmissions);

        // Daily trend (last 7 days)
        List<DailyAnalyticsResponse.DailyEmissionTrend> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            double dailyVal = sumEmissionsForDateRange(user.getId(), d, d);
            trend.add(DailyAnalyticsResponse.DailyEmissionTrend.builder()
                    .date(d.toString())
                    .emissions(round(dailyVal))
                    .build());
        }

        return DailyAnalyticsResponse.builder()
                .todayEmissions(round(todayEmissions))
                .yesterdayEmissions(round(yesterdayEmissions))
                .percentageChange(round(pctChange))
                .trend(trend)
                .build();
    }

    // --- WEEKLY EMISSION ANALYTICS ---
    public WeeklyAnalyticsResponse getWeeklyAnalytics(User user) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(java.time.DayOfWeek.SUNDAY);

        LocalDate startOfPrevWeek = startOfWeek.minusWeeks(1);
        LocalDate endOfPrevWeek = endOfWeek.minusWeeks(1);

        double currentWeekVal = sumEmissionsForDateRange(user.getId(), startOfWeek, endOfWeek);
        double prevWeekVal = sumEmissionsForDateRange(user.getId(), startOfPrevWeek, endOfPrevWeek);

        double pctChange = calculatePercentageChange(currentWeekVal, prevWeekVal);

        // Weekly trend (last 4 weeks)
        List<WeeklyAnalyticsResponse.WeeklyEmissionTrend> trend = new ArrayList<>();
        WeekFields weekFields = WeekFields.ISO;
        for (int i = 3; i >= 0; i--) {
            LocalDate start = startOfWeek.minusWeeks(i);
            LocalDate end = endOfWeek.minusWeeks(i);
            double val = sumEmissionsForDateRange(user.getId(), start, end);
            int wkNum = start.get(weekFields.weekOfWeekBasedYear());
            trend.add(WeeklyAnalyticsResponse.WeeklyEmissionTrend.builder()
                    .weekLabel("Wk " + wkNum)
                    .emissions(round(val))
                    .build());
        }

        return WeeklyAnalyticsResponse.builder()
                .currentWeekEmissions(round(currentWeekVal))
                .previousWeekEmissions(round(prevWeekVal))
                .percentageChange(round(pctChange))
                .trend(trend)
                .build();
    }

    // --- MONTHLY EMISSION ANALYTICS ---
    public MonthlyAnalyticsResponse getMonthlyAnalytics(User user) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        LocalDate startOfPrevMonth = startOfMonth.minusMonths(1);
        LocalDate endOfPrevMonth = startOfPrevMonth.withDayOfMonth(startOfPrevMonth.lengthOfMonth());

        double currentMonthVal = sumEmissionsForDateRange(user.getId(), startOfMonth, endOfMonth);
        double prevMonthVal = sumEmissionsForDateRange(user.getId(), startOfPrevMonth, endOfPrevMonth);

        double pctChange = calculatePercentageChange(currentMonthVal, prevMonthVal);

        // Monthly trend (last 6 months)
        List<MonthlyAnalyticsResponse.MonthlyEmissionTrend> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate start = startOfMonth.minusMonths(i);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            double val = sumEmissionsForDateRange(user.getId(), start, end);
            String label = start.getMonth().name().substring(0, 3) + " " + start.getYear();
            trend.add(MonthlyAnalyticsResponse.MonthlyEmissionTrend.builder()
                    .monthLabel(label)
                    .emissions(round(val))
                    .build());
        }

        return MonthlyAnalyticsResponse.builder()
                .currentMonthEmissions(round(currentMonthVal))
                .previousMonthEmissions(round(prevMonthVal))
                .percentageChange(round(pctChange))
                .trend(trend)
                .build();
    }

    // --- CATEGORY BREAKDOWN ---
    public List<CategoryBreakdownResponse> getCategoryBreakdown(User user) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        double total = logs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();

        Map<Category, Double> categorySums = new EnumMap<>(Category.class);
        for (Category cat : Category.values()) {
            categorySums.put(cat, 0.0);
        }

        for (ActivityLog log : logs) {
            categorySums.put(log.getCategory(), categorySums.getOrDefault(log.getCategory(), 0.0) + log.getCarbonEmission());
        }

        List<CategoryBreakdownResponse> breakdown = new ArrayList<>();
        for (Category cat : Category.values()) {
            double sumVal = categorySums.get(cat);
            double pct = total == 0 ? 0.0 : (sumVal / total) * 100.0;
            breakdown.add(CategoryBreakdownResponse.builder()
                    .category(cat.name())
                    .emissionValue(round(sumVal))
                    .percentageContribution(round(pct))
                    .build());
        }
        return breakdown;
    }

    // --- TREND ANALYSIS & SUSTAINABILITY INSIGHTS ---
    public TrendAnalysisResponse getTrendsAndInsights(User user) {
        LocalDate today = LocalDate.now();

        // 1. Daily Trend
        double todayVal = sumEmissionsForDateRange(user.getId(), today, today);
        double yesterdayVal = sumEmissionsForDateRange(user.getId(), today.minusDays(1), today.minusDays(1));
        String dailyStatus = determineTrendStatus(todayVal, yesterdayVal);

        // 2. Weekly Trend
        LocalDate startOfWeek = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(java.time.DayOfWeek.SUNDAY);
        double currentWeekVal = sumEmissionsForDateRange(user.getId(), startOfWeek, endOfWeek);
        double prevWeekVal = sumEmissionsForDateRange(user.getId(), startOfWeek.minusWeeks(1), endOfWeek.minusWeeks(1));
        String weeklyStatus = determineTrendStatus(currentWeekVal, prevWeekVal);

        // 3. Monthly Trend
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        double currentMonthVal = sumEmissionsForDateRange(user.getId(), startOfMonth, endOfMonth);
        double prevMonthVal = sumEmissionsForDateRange(user.getId(), startOfMonth.minusMonths(1), startOfMonth.minusMonths(1).withDayOfMonth(startOfMonth.minusMonths(1).lengthOfMonth()));
        String monthlyStatus = determineTrendStatus(currentMonthVal, prevMonthVal);

        // 4. Generate Textual Insights
        List<String> insights = new ArrayList<>();

        // Overall weekly comparison
        double weeklyDiffPct = calculatePercentageChange(currentWeekVal, prevWeekVal);
        if (prevWeekVal > 0) {
            if (weeklyDiffPct < 0) {
                insights.add("Your overall emissions decreased by " + String.format("%.1f", Math.abs(weeklyDiffPct)) + "% this week compared to last week.");
            } else if (weeklyDiffPct > 0) {
                insights.add("Your overall emissions increased by " + String.format("%.1f", weeklyDiffPct) + "% this week. Try reducing non-essential travels or power usage.");
            }
        } else if (currentWeekVal > 0) {
            insights.add("You started logging emissions this week with a total of " + String.format("%.1f", currentWeekVal) + " kg CO₂.");
        }

        // Category-wise comparisons for monthly details
        for (Category cat : Category.values()) {
            double curCatVal = sumEmissionsForDateRangeAndCategory(user.getId(), startOfMonth, endOfMonth, cat);
            double prevCatVal = sumEmissionsForDateRangeAndCategory(user.getId(), startOfMonth.minusMonths(1), startOfMonth.minusMonths(1).withDayOfMonth(startOfMonth.minusMonths(1).lengthOfMonth()), cat);
            double catPct = calculatePercentageChange(curCatVal, prevCatVal);

            if (prevCatVal > 0 && Math.abs(catPct) > 1.0) {
                String verb = catPct > 0 ? "increased" : "decreased";
                insights.add("Your " + cat.name().toLowerCase() + " emissions " + verb + " by " + String.format("%.1f", Math.abs(catPct)) + "% this month.");
            }
        }

        // Dominant category insight
        List<CategoryBreakdownResponse> catBreakdown = getCategoryBreakdown(user);
        CategoryBreakdownResponse highestCat = catBreakdown.stream()
                .max(Comparator.comparingDouble(CategoryBreakdownResponse::getEmissionValue))
                .orElse(null);

        if (highestCat != null && highestCat.getEmissionValue() > 0) {
            insights.add(highestCat.getCategory().substring(0,1).toUpperCase() + highestCat.getCategory().substring(1).toLowerCase() + 
                    " contributes " + String.format("%.1f", highestCat.getPercentageContribution()) + "% of your overall carbon footprint.");
            
            if (highestCat.getCategory().equals("TRANSPORT")) {
                insights.add("Reducing car travel by 20% can save approximately " + String.format("%.1f", highestCat.getEmissionValue() * 0.2 * 12) + " kg CO₂ annually.");
            }
        }

        return TrendAnalysisResponse.builder()
                .dailyTrend(dailyStatus)
                .weeklyTrend(weeklyStatus)
                .monthlyTrend(monthlyStatus)
                .insights(insights)
                .build();
    }

    // --- BENCHMARKING DASHBOARD ---
    public BenchmarkingResponse getBenchmarking(User user) {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        // User emissions this month
        double userEmissions = sumEmissionsForDateRange(user.getId(), startOfMonth, endOfMonth);

        // Platform-wide calculations
        List<User> allUsers = userRepository.findAll();
        double totalPlatformEmissionsThisMonth = 0.0;
        int activeUsersCount = 0;

        Map<Long, Double> userFootprints = new HashMap<>();

        for (User u : allUsers) {
            double uEm = sumEmissionsForDateRange(u.getId(), startOfMonth, endOfMonth);
            userFootprints.put(u.getId(), uEm);
            if (uEm > 0) {
                totalPlatformEmissionsThisMonth += uEm;
                activeUsersCount++;
            }
        }

        double platformAvg = activeUsersCount == 0 ? 0.0 : totalPlatformEmissionsThisMonth / activeUsersCount;
        double platformDiff = calculatePercentageChange(userEmissions, platformAvg);

        // Organization Average
        Double orgAvg = null;
        Double orgDiff = null;
        List<OrganizationUser> orgLinks = organizationUserRepository.findByUserId(user.getId());
        if (!orgLinks.isEmpty()) {
            OrganizationUser link = orgLinks.get(0);
            Long orgId = link.getOrganization().getId();
            List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(orgId);
            
            double totalOrgEm = 0.0;
            int activeOrgUsers = 0;
            for (OrganizationUser member : members) {
                double em = userFootprints.getOrDefault(member.getUser().getId(), 0.0);
                if (em > 0) {
                    totalOrgEm += em;
                    activeOrgUsers++;
                }
            }
            if (activeOrgUsers > 0) {
                orgAvg = totalOrgEm / activeOrgUsers;
                orgDiff = calculatePercentageChange(userEmissions, orgAvg);
            }
        }

        // Similar Users in same country/city cohort
        List<User> cohort = allUsers.stream()
                .filter(u -> u.getCountry() != null && u.getCountry().equalsIgnoreCase(user.getCountry()))
                .collect(Collectors.toList());
        if (cohort.size() < 3) {
            cohort = allUsers; // fall back to all users
        }

        double cohortTotal = 0.0;
        int cohortActive = 0;
        for (User cu : cohort) {
            double em = userFootprints.getOrDefault(cu.getId(), 0.0);
            if (em > 0) {
                cohortTotal += em;
                cohortActive++;
            }
        }
        double similarAvg = cohortActive == 0 ? 0.0 : cohortTotal / cohortActive;
        double similarDiff = calculatePercentageChange(userEmissions, similarAvg);

        // Percentile Ranking
        long totalActiveUsers = userFootprints.values().stream().filter(f -> f > 0).count();
        double percentile = 100.0;
        if (totalActiveUsers > 1 && userEmissions > 0) {
            long usersEmittingMore = userFootprints.values().stream()
                    .filter(f -> f > userEmissions)
                    .count();
            percentile = ((double) usersEmittingMore * 100.0) / (totalActiveUsers - 1);
        } else if (userEmissions == 0) {
            percentile = 100.0; // perfect score if they have no footprint this month
        }

        // Create insight text
        String comparisonInsight = "";
        if (userEmissions < platformAvg) {
            double lessPct = ((platformAvg - userEmissions) / platformAvg) * 100.0;
            comparisonInsight = "You emit " + String.format("%.1f", lessPct) + "% less carbon than the platform average.";
        } else if (userEmissions > platformAvg) {
            double morePct = ((userEmissions - platformAvg) / platformAvg) * 100.0;
            comparisonInsight = "You emit " + String.format("%.1f", morePct) + "% more carbon than the platform average.";
        } else {
            comparisonInsight = "Your carbon footprint matches the platform average exactly.";
        }

        return BenchmarkingResponse.builder()
                .yourEmissions(round(userEmissions))
                .platformAverage(round(platformAvg))
                .platformDifferencePercentage(round(platformDiff))
                .organizationAverage(orgAvg != null ? round(orgAvg) : null)
                .organizationDifferencePercentage(orgDiff != null ? round(orgDiff) : null)
                .similarUsersAverage(round(similarAvg))
                .similarUsersDifferencePercentage(round(similarDiff))
                .percentileRanking(round(percentile))
                .comparisonInsight(comparisonInsight)
                .build();
    }

    // --- PERSONALIZED RECOMMENDATION ENGINE ---
    public PersonalizedRecommendationResponse getPersonalizedRecommendations(User user) {
        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);

        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), thirtyDaysAgo, today);

        // Top 3 highest-emission activities
        Map<String, Double> emissionMap = new HashMap<>();
        Map<String, Integer> freqMap = new HashMap<>();
        for (ActivityLog log : logs) {
            String type = log.getActivityType() != null ? log.getActivityType() : "Unknown";
            emissionMap.put(type, emissionMap.getOrDefault(type, 0.0) + log.getCarbonEmission());
            freqMap.put(type, freqMap.getOrDefault(type, 0) + 1);
        }

        List<PersonalizedRecommendationResponse.ActivityEmission> topActivities = emissionMap.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(3)
                .map(e -> PersonalizedRecommendationResponse.ActivityEmission.builder()
                        .activityType(e.getKey())
                        .emission(round(e.getValue()))
                        .build())
                .collect(Collectors.toList());

        // Highest contributing category
        Map<Category, Double> catSums = new EnumMap<>(Category.class);
        for (ActivityLog log : logs) {
            catSums.put(log.getCategory(), catSums.getOrDefault(log.getCategory(), 0.0) + log.getCarbonEmission());
        }
        Category highestCat = catSums.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(Category.TRANSPORT); // default fallback

        // Most frequent activity
        String mostFreq = freqMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        // Generate Tips
        List<ReductionTipResponse> recommendations = new ArrayList<>();

        if (highestCat == Category.TRANSPORT || hasActivity(topActivities, "car") || hasActivity(topActivities, "drive")) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Use public transportation twice a week instead of driving.")
                    .estimatedSavings("Potential reduction: 12.5 kg CO₂/month")
                    .difficulty("Medium")
                    .impact("High")
                    .category("TRANSPORT")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Carpool with colleagues or neighbors for your work commute.")
                    .estimatedSavings("Potential reduction: 8.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("TRANSPORT")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Walk or cycle for short neighborhood trips under 3 km.")
                    .estimatedSavings("Potential reduction: 4.5 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Low")
                    .category("TRANSPORT")
                    .build());
        }

        if (highestCat == Category.ELECTRICITY || hasActivity(topActivities, "electricity") || hasActivity(topActivities, "grid")) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Unplug standby electronics and switch off unused appliances.")
                    .estimatedSavings("Potential reduction: 5.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("ELECTRICITY")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Switch your household light bulbs to energy-efficient LEDs.")
                    .estimatedSavings("Potential reduction: 3.5 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Low")
                    .category("ELECTRICITY")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Configure your AC unit 2 degrees warmer or reduce use by 1 hour daily.")
                    .estimatedSavings("Potential reduction: 14.0 kg CO₂/month")
                    .difficulty("Medium")
                    .impact("High")
                    .category("ELECTRICITY")
                    .build());
        }

        if (highestCat == Category.FOOD || hasActivity(topActivities, "beef") || hasActivity(topActivities, "meat")) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Reduce beef and pork consumption; choose plant proteins or poultry instead.")
                    .estimatedSavings("Potential reduction: 10.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("FOOD")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Designate two days per week as plant-based or vegetarian days.")
                    .estimatedSavings("Potential reduction: 15.0 kg CO₂/month")
                    .difficulty("Medium")
                    .impact("High")
                    .category("FOOD")
                    .build());
        }

        if (highestCat == Category.SHOPPING || hasActivity(topActivities, "shop") || hasActivity(topActivities, "clothes")) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Avoid fast-fashion products; purchase high-quality durable goods.")
                    .estimatedSavings("Potential reduction: 6.5 kg CO₂/month")
                    .difficulty("Medium")
                    .impact("Medium")
                    .category("SHOPPING")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Institute a 48-hour cool-off period before completing non-essential purchases.")
                    .estimatedSavings("Potential reduction: 8.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("SHOPPING")
                    .build());
        }

        // Fallback default recommendations if lists are sparse
        if (recommendations.isEmpty()) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Maintain your tires inflated properly to cut transport carbon.")
                    .estimatedSavings("Potential reduction: 3.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Low")
                    .category("TRANSPORT")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Wash your laundry in cold water to save water-heating energy.")
                    .estimatedSavings("Potential reduction: 4.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("ELECTRICITY")
                    .build());
        }

        return PersonalizedRecommendationResponse.builder()
                .topActivities(topActivities)
                .highestCategory(highestCat.name())
                .mostFrequentActivity(mostFreq)
                .recommendations(recommendations)
                .build();
    }

    private boolean hasActivity(List<PersonalizedRecommendationResponse.ActivityEmission> top, String match) {
        return top.stream().anyMatch(a -> a.getActivityType().toLowerCase().contains(match.toLowerCase()));
    }

    // --- GENERAL REDUCTION SUGGESTIONS ---
    public List<ReductionTipResponse> getGeneralReductionTips() {
        List<ReductionTipResponse> tips = new ArrayList<>();
        tips.add(ReductionTipResponse.builder()
                .action("Use public transportation 2 days per week")
                .estimatedSavings("Potential reduction: 6.5 kg CO₂/month")
                .difficulty("Easy")
                .impact("Medium")
                .category("TRANSPORT")
                .build());
        tips.add(ReductionTipResponse.builder()
                .action("Carpool with colleagues to work")
                .estimatedSavings("Potential reduction: 9.8 kg CO₂/month")
                .difficulty("Easy")
                .impact("Medium")
                .category("TRANSPORT")
                .build());
        tips.add(ReductionTipResponse.builder()
                .action("Switch off unused home electronics")
                .estimatedSavings("Potential reduction: 4.2 kg CO₂/month")
                .difficulty("Easy")
                .impact("Medium")
                .category("ELECTRICITY")
                .build());
        tips.add(ReductionTipResponse.builder()
                .action("Swap classic bulbs for LEDs")
                .estimatedSavings("Potential reduction: 2.8 kg CO₂/month")
                .difficulty("Easy")
                .impact("Low")
                .category("ELECTRICITY")
                .build());
        tips.add(ReductionTipResponse.builder()
                .action("Reduce red meat intake")
                .estimatedSavings("Potential reduction: 11.5 kg CO₂/month")
                .difficulty("Easy")
                .impact("High")
                .category("FOOD")
                .build());
        tips.add(ReductionTipResponse.builder()
                .action("Try vegetarian lunch options")
                .estimatedSavings("Potential reduction: 7.2 kg CO₂/month")
                .difficulty("Easy")
                .impact("Medium")
                .category("FOOD")
                .build());
        tips.add(ReductionTipResponse.builder()
                .action("Reduce fast-fashion purchases")
                .estimatedSavings("Potential reduction: 5.5 kg CO₂/month")
                .difficulty("Medium")
                .impact("Medium")
                .category("SHOPPING")
                .build());
        return tips;
    }

    // Period Analytics unified calculation engine
    public PeriodAnalyticsResponse getPeriodAnalytics(User user, String periodType, LocalDate date, Integer week, Integer month, Integer year, LocalDate startDate, LocalDate endDate) {
        LocalDate start = null;
        LocalDate end = null;
        LocalDate prevStart = null;
        LocalDate prevEnd = null;

        if ("DAILY".equalsIgnoreCase(periodType)) {
            if (date == null && (startDate != null || endDate != null)) {
                start = startDate;
                end = endDate;
                long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
                prevStart = start.minusDays(days);
                prevEnd = start.minusDays(1);
            } else {
                start = date != null ? date : LocalDate.now();
                end = start;
                prevStart = start.minusDays(1);
                prevEnd = prevStart;
            }
        } else if ("WEEKLY".equalsIgnoreCase(periodType)) {
            if (week != null && year != null) {
                start = LocalDate.of(year, 1, 4)
                        .with(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear(), week)
                        .with(java.time.DayOfWeek.MONDAY);
            } else {
                start = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
            }
            end = start.plusDays(6);
            prevStart = start.minusWeeks(1);
            prevEnd = end.minusWeeks(1);
        } else if ("MONTHLY".equalsIgnoreCase(periodType)) {
            if (month != null && year != null) {
                start = LocalDate.of(year, month, 1);
            } else {
                start = LocalDate.now().withDayOfMonth(1);
            }
            end = start.withDayOfMonth(start.lengthOfMonth());
            prevStart = start.minusMonths(1);
            prevEnd = prevStart.withDayOfMonth(prevStart.lengthOfMonth());
        } else if ("YEARLY".equalsIgnoreCase(periodType)) {
            int y = year != null ? year : LocalDate.now().getYear();
            start = LocalDate.of(y, 1, 1);
            end = LocalDate.of(y, 12, 31);
            prevStart = start.minusYears(1);
            prevEnd = prevStart.withMonth(12).withDayOfMonth(31);
        } else {
            start = startDate != null ? startDate : LocalDate.now().minusDays(30);
            end = endDate != null ? endDate : LocalDate.now();
            long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
            prevStart = start.minusDays(days);
            prevEnd = start.minusDays(1);
        }

        double totalEmissions = sumEmissionsForDateRange(user.getId(), start, end);
        double previousPeriodEmissions = sumEmissionsForDateRange(user.getId(), prevStart, prevEnd);
        double percentageChange = calculatePercentageChange(totalEmissions, previousPeriodEmissions);

        // Sustainability score based on 5.0 kg baseline per day
        long daysCount = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        double completedSavings = 0.0;
        if (recommendationService != null) {
            completedSavings = recommendationService.getCompletedMonthlySavings(user);
        }
        double dailySavings = completedSavings / 30.0;
        double adjustedEmissions = Math.max(0.0, totalEmissions - dailySavings * daysCount);
        double sustainabilityScore = Math.max(0.0, Math.min(100.0, 100.0 - (adjustedEmissions / (5.0 * daysCount)) * 10.0));

        // Category breakdown
        double transportTotal = sumEmissionsForDateRangeAndCategory(user.getId(), start, end, Category.TRANSPORT);
        double electricityTotal = sumEmissionsForDateRangeAndCategory(user.getId(), start, end, Category.ELECTRICITY);
        double foodTotal = sumEmissionsForDateRangeAndCategory(user.getId(), start, end, Category.FOOD);
        double shoppingTotal = sumEmissionsForDateRangeAndCategory(user.getId(), start, end, Category.SHOPPING);

        // Trend calculations
        List<PeriodAnalyticsResponse.TrendPoint> trend = new ArrayList<>();
        if ("DAILY".equalsIgnoreCase(periodType)) {
            // Last 7 days ending at 'end'
            for (int i = 6; i >= 0; i--) {
                LocalDate d = end.minusDays(i);
                trend.add(new PeriodAnalyticsResponse.TrendPoint(d.toString(), round(sumEmissionsForDateRange(user.getId(), d, d))));
            }
        } else if ("WEEKLY".equalsIgnoreCase(periodType)) {
            // Last 4 weeks ending at 'end'
            java.time.temporal.WeekFields weekFields = java.time.temporal.WeekFields.ISO;
            for (int i = 3; i >= 0; i--) {
                LocalDate wStart = start.minusWeeks(i);
                LocalDate wEnd = end.minusWeeks(i);
                int wkNum = wStart.get(weekFields.weekOfWeekBasedYear());
                trend.add(new PeriodAnalyticsResponse.TrendPoint("Wk " + wkNum, round(sumEmissionsForDateRange(user.getId(), wStart, wEnd))));
            }
        } else if ("MONTHLY".equalsIgnoreCase(periodType)) {
            // Last 6 months ending at 'end'
            for (int i = 5; i >= 0; i--) {
                LocalDate mStart = start.minusMonths(i);
                LocalDate mEnd = mStart.withDayOfMonth(mStart.lengthOfMonth());
                String label = mStart.getMonth().name().substring(0, 3) + " " + mStart.getYear();
                trend.add(new PeriodAnalyticsResponse.TrendPoint(label, round(sumEmissionsForDateRange(user.getId(), mStart, mEnd))));
            }
        } else if ("YEARLY".equalsIgnoreCase(periodType)) {
            // 12 months breakdown of 'year'
            int currentYear = start.getYear();
            for (int m = 1; m <= 12; m++) {
                LocalDate mStart = LocalDate.of(currentYear, m, 1);
                LocalDate mEnd = mStart.withDayOfMonth(mStart.lengthOfMonth());
                String label = mStart.getMonth().name().substring(0, 3);
                trend.add(new PeriodAnalyticsResponse.TrendPoint(label, round(sumEmissionsForDateRange(user.getId(), mStart, mEnd))));
            }
        } else {
            // CUSTOM / DATE-RANGE: daily summaries in that range
            if (daysCount <= 31) {
                for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                    trend.add(new PeriodAnalyticsResponse.TrendPoint(d.toString(), round(sumEmissionsForDateRange(user.getId(), d, d))));
                }
            } else {
                // weekly interval trend for custom range to avoid chart clutter
                for (LocalDate d = start; d.isBefore(end.plusDays(1)); d = d.plusWeeks(1)) {
                    LocalDate wEnd = d.plusDays(6).isAfter(end) ? end : d.plusDays(6);
                    trend.add(new PeriodAnalyticsResponse.TrendPoint(d.toString(), round(sumEmissionsForDateRange(user.getId(), d, wEnd))));
                }
            }
        }

        // Generate Textual Insights
        List<String> insights = new ArrayList<>();
        if (previousPeriodEmissions > 0) {
            String periodName = periodType.toLowerCase();
            if ("custom".equalsIgnoreCase(periodName)) periodName = "period";
            if (percentageChange < -1.0) {
                insights.add("Your overall emissions decreased by " + String.format("%.1f", Math.abs(percentageChange)) + "% this " + periodName + " compared to the previous period.");
            } else if (percentageChange > 1.0) {
                insights.add("Your overall emissions increased by " + String.format("%.1f", percentageChange) + "% this " + periodName + ". Try reducing non-essential travels or power usage.");
            } else {
                insights.add("Your overall emissions remained stable compared to the previous period.");
            }
        } else if (totalEmissions > 0) {
            insights.add("You logged a total of " + String.format("%.1f", totalEmissions) + " kg CO₂ during this period.");
        }

        // Category-wise comparisons
        for (Category cat : Category.values()) {
            double curCatVal = sumEmissionsForDateRangeAndCategory(user.getId(), start, end, cat);
            double prevCatVal = sumEmissionsForDateRangeAndCategory(user.getId(), prevStart, prevEnd, cat);
            double catPct = calculatePercentageChange(curCatVal, prevCatVal);

            if (prevCatVal > 0 && Math.abs(catPct) > 1.0) {
                String verb = catPct > 0 ? "increased" : "decreased";
                insights.add("Your " + cat.name().toLowerCase() + " emissions " + verb + " by " + String.format("%.1f", Math.abs(catPct)) + "% compared to the previous period.");
            }
        }

        // Dominant category insight
        Map<Category, Double> catTotals = new EnumMap<>(Category.class);
        catTotals.put(Category.TRANSPORT, transportTotal);
        catTotals.put(Category.ELECTRICITY, electricityTotal);
        catTotals.put(Category.FOOD, foodTotal);
        catTotals.put(Category.SHOPPING, shoppingTotal);
        
        Category highestCat = catTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
        double highestVal = highestCat != null ? catTotals.get(highestCat) : 0.0;

        if (highestCat != null && highestVal > 0) {
            double pct = totalEmissions > 0 ? (highestVal / totalEmissions) * 100.0 : 0.0;
            insights.add(highestCat.name().substring(0,1).toUpperCase() + highestCat.name().substring(1).toLowerCase() + 
                    " contributes " + String.format("%.1f", pct) + "% of your overall carbon footprint for this period.");
            
            if (highestCat == Category.TRANSPORT) {
                insights.add("Reducing car travel by 20% can save approximately " + String.format("%.1f", highestVal * 0.2 * 12) + " kg CO₂ annually.");
            }
        }

        // Recommendations
        PersonalizedRecommendationResponse recResponse = getPersonalizedRecommendationsForPeriod(user, start, end);
        List<ReductionTipResponse> recommendations = recResponse.getRecommendations();

        // Benchmarking
        BenchmarkingResponse benchmarking = getBenchmarkingForPeriod(user, start, end);

        String trendLabel = determineTrendStatus(totalEmissions, previousPeriodEmissions);

        return PeriodAnalyticsResponse.builder()
                .totalEmissions(round(totalEmissions))
                .sustainabilityScore(round(sustainabilityScore))
                .transportTotal(round(transportTotal))
                .electricityTotal(round(electricityTotal))
                .foodTotal(round(foodTotal))
                .shoppingTotal(round(shoppingTotal))
                .previousPeriodEmissions(round(previousPeriodEmissions))
                .percentageChange(round(percentageChange))
                .trendLabel(trendLabel)
                .trend(trend)
                .recommendations(recommendations)
                .benchmarking(benchmarking)
                .insights(insights)
                .build();
    }

    // Personalized recommendations for a specific period
    public PersonalizedRecommendationResponse getPersonalizedRecommendationsForPeriod(User user, LocalDate start, LocalDate end) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), start, end);

        // Top 3 highest-emission activities
        Map<String, Double> emissionMap = new HashMap<>();
        Map<String, Integer> freqMap = new HashMap<>();
        for (ActivityLog log : logs) {
            String type = log.getActivityType() != null ? log.getActivityType() : "Unknown";
            emissionMap.put(type, emissionMap.getOrDefault(type, 0.0) + log.getCarbonEmission());
            freqMap.put(type, freqMap.getOrDefault(type, 0) + 1);
        }

        List<PersonalizedRecommendationResponse.ActivityEmission> topActivities = emissionMap.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(3)
                .map(e -> PersonalizedRecommendationResponse.ActivityEmission.builder()
                        .activityType(e.getKey())
                        .emission(round(e.getValue()))
                        .build())
                .collect(Collectors.toList());

        // Highest contributing category
        Map<Category, Double> catSums = new EnumMap<>(Category.class);
        for (Category cat : Category.values()) {
            catSums.put(cat, 0.0);
        }
        for (ActivityLog log : logs) {
            catSums.put(log.getCategory(), catSums.getOrDefault(log.getCategory(), 0.0) + log.getCarbonEmission());
        }
        Category highestCat = catSums.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(Category.TRANSPORT); // default fallback

        // Most frequent activity
        String mostFreq = freqMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        // Generate Tips
        List<ReductionTipResponse> recommendations = new ArrayList<>();

        if (highestCat == Category.TRANSPORT || hasActivity(topActivities, "car") || hasActivity(topActivities, "drive")) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Use public transportation twice a week instead of driving.")
                    .estimatedSavings("Potential reduction: 12.5 kg CO₂/month")
                    .difficulty("Medium")
                    .impact("High")
                    .category("TRANSPORT")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Carpool with colleagues or neighbors for your work commute.")
                    .estimatedSavings("Potential reduction: 8.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("TRANSPORT")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Walk or cycle for short neighborhood trips under 3 km.")
                    .estimatedSavings("Potential reduction: 4.5 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Low")
                    .category("TRANSPORT")
                    .build());
        }

        if (highestCat == Category.ELECTRICITY || hasActivity(topActivities, "electricity") || hasActivity(topActivities, "grid")) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Unplug standby electronics and switch off unused appliances.")
                    .estimatedSavings("Potential reduction: 5.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("ELECTRICITY")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Switch your household light bulbs to energy-efficient LEDs.")
                    .estimatedSavings("Potential reduction: 3.5 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Low")
                    .category("ELECTRICITY")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Configure your AC unit 2 degrees warmer or reduce use by 1 hour daily.")
                    .estimatedSavings("Potential reduction: 14.0 kg CO₂/month")
                    .difficulty("Medium")
                    .impact("High")
                    .category("ELECTRICITY")
                    .build());
        }

        if (highestCat == Category.FOOD || hasActivity(topActivities, "beef") || hasActivity(topActivities, "meat")) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Reduce beef and pork consumption; choose plant proteins or poultry instead.")
                    .estimatedSavings("Potential reduction: 10.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("FOOD")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Designate two days per week as plant-based or vegetarian days.")
                    .estimatedSavings("Potential reduction: 15.0 kg CO₂/month")
                    .difficulty("Medium")
                    .impact("High")
                    .category("FOOD")
                    .build());
        }

        if (highestCat == Category.SHOPPING || hasActivity(topActivities, "shop") || hasActivity(topActivities, "clothes")) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Avoid fast-fashion products; purchase high-quality durable goods.")
                    .estimatedSavings("Potential reduction: 6.5 kg CO₂/month")
                    .difficulty("Medium")
                    .impact("Medium")
                    .category("SHOPPING")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Institute a 48-hour cool-off period before completing non-essential purchases.")
                    .estimatedSavings("Potential reduction: 8.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("SHOPPING")
                    .build());
        }

        // Fallback default recommendations if lists are sparse
        if (recommendations.isEmpty()) {
            recommendations.add(ReductionTipResponse.builder()
                    .action("Maintain your tires inflated properly to cut transport carbon.")
                    .estimatedSavings("Potential reduction: 3.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Low")
                    .category("TRANSPORT")
                    .build());
            recommendations.add(ReductionTipResponse.builder()
                    .action("Wash your laundry in cold water to save water-heating energy.")
                    .estimatedSavings("Potential reduction: 4.0 kg CO₂/month")
                    .difficulty("Easy")
                    .impact("Medium")
                    .category("ELECTRICITY")
                    .build());
        }

        return PersonalizedRecommendationResponse.builder()
                .topActivities(topActivities)
                .highestCategory(highestCat.name())
                .mostFrequentActivity(mostFreq)
                .recommendations(recommendations)
                .build();
    }

    // Benchmarking dashboard calculated for a specific period
    public BenchmarkingResponse getBenchmarkingForPeriod(User user, LocalDate start, LocalDate end) {
        // User emissions this period
        double userEmissions = sumEmissionsForDateRange(user.getId(), start, end);

        // Platform-wide calculations
        List<User> allUsers = userRepository.findAll();
        double totalPlatformEmissions = 0.0;
        int activeUsersCount = 0;

        Map<Long, Double> userFootprints = new HashMap<>();

        for (User u : allUsers) {
            double uEm = sumEmissionsForDateRange(u.getId(), start, end);
            userFootprints.put(u.getId(), uEm);
            if (uEm > 0) {
                totalPlatformEmissions += uEm;
                activeUsersCount++;
            }
        }

        double platformAvg = activeUsersCount == 0 ? 0.0 : totalPlatformEmissions / activeUsersCount;
        double platformDiff = calculatePercentageChange(userEmissions, platformAvg);

        // Organization Average
        Double orgAvg = null;
        Double orgDiff = null;
        List<OrganizationUser> orgLinks = organizationUserRepository.findByUserId(user.getId());
        if (!orgLinks.isEmpty()) {
            OrganizationUser link = orgLinks.get(0);
            Long orgId = link.getOrganization().getId();
            List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(orgId);
            
            double totalOrgEm = 0.0;
            int activeOrgUsers = 0;
            for (OrganizationUser member : members) {
                double em = userFootprints.getOrDefault(member.getUser().getId(), 0.0);
                if (em > 0) {
                    totalOrgEm += em;
                    activeOrgUsers++;
                }
            }
            if (activeOrgUsers > 0) {
                orgAvg = totalOrgEm / activeOrgUsers;
                orgDiff = calculatePercentageChange(userEmissions, orgAvg);
            }
        }

        // Similar Users in same country/city cohort
        List<User> cohort = allUsers.stream()
                .filter(u -> u.getCountry() != null && u.getCountry().equalsIgnoreCase(user.getCountry()))
                .collect(Collectors.toList());
        if (cohort.size() < 3) {
            cohort = allUsers; // fall back to all users
        }

        double cohortTotal = 0.0;
        int cohortActive = 0;
        for (User cu : cohort) {
            double em = userFootprints.getOrDefault(cu.getId(), 0.0);
            if (em > 0) {
                cohortTotal += em;
                cohortActive++;
            }
        }
        double similarAvg = cohortActive == 0 ? 0.0 : cohortTotal / cohortActive;
        double similarDiff = calculatePercentageChange(userEmissions, similarAvg);

        // Percentile Ranking
        long totalActiveUsers = userFootprints.values().stream().filter(f -> f > 0).count();
        double percentile = 100.0;
        if (totalActiveUsers > 1 && userEmissions > 0) {
            long usersEmittingMore = userFootprints.values().stream()
                    .filter(f -> f > userEmissions)
                    .count();
            percentile = ((double) usersEmittingMore * 100.0) / (totalActiveUsers - 1);
        } else if (userEmissions == 0) {
            percentile = 100.0;
        }

        // Create insight text
        String comparisonInsight = "";
        if (userEmissions < platformAvg) {
            double lessPct = ((platformAvg - userEmissions) / platformAvg) * 100.0;
            comparisonInsight = "You emit " + String.format("%.1f", lessPct) + "% less carbon than the platform average.";
        } else if (userEmissions > platformAvg) {
            double morePct = ((userEmissions - platformAvg) / platformAvg) * 100.0;
            comparisonInsight = "You emit " + String.format("%.1f", morePct) + "% more carbon than the platform average.";
        } else {
            comparisonInsight = "Your carbon footprint matches the platform average exactly.";
        }

        return BenchmarkingResponse.builder()
                .yourEmissions(round(userEmissions))
                .platformAverage(round(platformAvg))
                .platformDifferencePercentage(round(platformDiff))
                .organizationAverage(orgAvg != null ? round(orgAvg) : null)
                .organizationDifferencePercentage(orgDiff != null ? round(orgDiff) : null)
                .similarUsersAverage(round(similarAvg))
                .similarUsersDifferencePercentage(round(similarDiff))
                .percentileRanking(round(percentile))
                .comparisonInsight(comparisonInsight)
                .build();
    }

    // --- HELPER CALCULATIONS ---
    private double sumEmissionsForDateRange(Long userId, LocalDate start, LocalDate end) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(userId, start, end);
        return logs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
    }

    private double sumEmissionsForDateRangeAndCategory(Long userId, LocalDate start, LocalDate end, Category category) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(userId, start, end);
        return logs.stream()
                .filter(l -> l.getCategory() == category)
                .mapToDouble(ActivityLog::getCarbonEmission)
                .sum();
    }

    private double calculatePercentageChange(double current, double previous) {
        if (previous == 0.0) {
            return current > 0.0 ? 100.0 : 0.0;
        }
        return ((current - previous) / previous) * 100.0;
    }

    private String determineTrendStatus(double current, double previous) {
        double diffPct = calculatePercentageChange(current, previous);
        if (diffPct < -3.0) {
            return "IMPROVING";
        } else if (diffPct > 3.0) {
            return "INCREASING";
        } else {
            return "STABLE";
        }
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
