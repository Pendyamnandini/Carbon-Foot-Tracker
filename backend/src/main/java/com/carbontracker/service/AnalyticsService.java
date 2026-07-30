package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;

@Service
public class AnalyticsService {

    @Autowired
    private DailyCarbonSummaryRepository dailyRepository;

    @Autowired
    private WeeklyCarbonSummaryRepository weeklyRepository;

    @Autowired
    private MonthlyCarbonSummaryRepository monthlyRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private RecommendationService recommendationService;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Transactional
    public void updateSummariesForUserAndDate(User user, LocalDate date) {
        WeekFields weekFields = WeekFields.ISO;
        int weekNumber = date.get(weekFields.weekOfWeekBasedYear());
        int month = date.getMonthValue();
        int year = date.getYear();

        // 1. Calculate Daily Summary
        List<ActivityLog> dailyLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), date, date);
        double dTrans = 0.0, dElect = 0.0, dFood = 0.0, dShop = 0.0;
        for (ActivityLog log : dailyLogs) {
            switch (log.getCategory()) {
                case TRANSPORT -> dTrans += log.getCarbonEmission();
                case ELECTRICITY -> dElect += log.getCarbonEmission();
                case FOOD -> dFood += log.getCarbonEmission();
                case SHOPPING -> dShop += log.getCarbonEmission();
            }
        }
        double completedSavings = 0.0;
        if (recommendationService != null) {
            completedSavings = recommendationService.getCompletedMonthlySavings(user);
        }
        double dailySavings = completedSavings / 30.0;
        double dTotal = dTrans + dElect + dFood + dShop;
        double adjustedDTotal = Math.max(0.0, dTotal - dailySavings);
        double dScore = Math.max(0.0, Math.min(100.0, 100.0 - (adjustedDTotal / 5.0) * 10.0));

        DailyCarbonSummary daily = dailyRepository.findByUserIdAndSummaryDate(user.getId(), date)
                .orElse(DailyCarbonSummary.builder().user(user).summaryDate(date).build());
        daily.setTransportTotal(dTrans);
        daily.setElectricityTotal(dElect);
        daily.setFoodTotal(dFood);
        daily.setShoppingTotal(dShop);
        daily.setOverallTotal(dTotal);
        daily.setActivityCount(dailyLogs.size());
        daily.setSustainabilityScore(dScore);
        dailyRepository.save(daily);

        // 2. Calculate Weekly Summary
        LocalDate startOfWeek = date.with(weekFields.dayOfWeek(), 1);
        LocalDate endOfWeek = date.with(weekFields.dayOfWeek(), 7);
        List<ActivityLog> weeklyLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), startOfWeek, endOfWeek);
        double wTrans = 0.0, wElect = 0.0, wFood = 0.0, wShop = 0.0;
        for (ActivityLog log : weeklyLogs) {
            switch (log.getCategory()) {
                case TRANSPORT -> wTrans += log.getCarbonEmission();
                case ELECTRICITY -> wElect += log.getCarbonEmission();
                case FOOD -> wFood += log.getCarbonEmission();
                case SHOPPING -> wShop += log.getCarbonEmission();
            }
        }
        double wTotal = wTrans + wElect + wFood + wShop;
        double adjustedWTotal = Math.max(0.0, wTotal - dailySavings * 7.0);
        double wScore = Math.max(0.0, Math.min(100.0, 100.0 - (adjustedWTotal / 35.0) * 10.0));

        WeeklyCarbonSummary weekly = weeklyRepository.findByUserIdAndWeekNumberAndYear(user.getId(), weekNumber, year)
                .orElse(WeeklyCarbonSummary.builder().user(user).weekNumber(weekNumber).year(year).build());
        weekly.setTransportTotal(wTrans);
        weekly.setElectricityTotal(wElect);
        weekly.setFoodTotal(wFood);
        weekly.setShoppingTotal(wShop);
        weekly.setOverallTotal(wTotal);
        weekly.setActivityCount(weeklyLogs.size());
        weekly.setSustainabilityScore(wScore);
        weeklyRepository.save(weekly);

        // 3. Calculate Monthly Summary
        LocalDate startOfMonth = date.withDayOfMonth(1);
        LocalDate endOfMonth = date.withDayOfMonth(date.lengthOfMonth());
        List<ActivityLog> monthlyLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), startOfMonth, endOfMonth);
        double mTrans = 0.0, mElect = 0.0, mFood = 0.0, mShop = 0.0;
        for (ActivityLog log : monthlyLogs) {
            switch (log.getCategory()) {
                case TRANSPORT -> mTrans += log.getCarbonEmission();
                case ELECTRICITY -> mElect += log.getCarbonEmission();
                case FOOD -> mFood += log.getCarbonEmission();
                case SHOPPING -> mShop += log.getCarbonEmission();
            }
        }
        double mTotal = mTrans + mElect + mFood + mShop;
        double adjustedMTotal = Math.max(0.0, mTotal - dailySavings * 30.0);
        double mScore = Math.max(0.0, Math.min(100.0, 100.0 - (adjustedMTotal / 150.0) * 10.0));

        MonthlyCarbonSummary monthly = monthlyRepository.findByUserIdAndMonthAndYear(user.getId(), month, year)
                .orElse(MonthlyCarbonSummary.builder().user(user).month(month).year(year).build());
        monthly.setTransportTotal(mTrans);
        monthly.setElectricityTotal(mElect);
        monthly.setFoodTotal(mFood);
        monthly.setShoppingTotal(mShop);
        monthly.setOverallTotal(mTotal);
        monthly.setActivityCount(monthlyLogs.size());
        monthly.setSustainabilityScore(mScore);
        monthlyRepository.save(monthly);
    }

    public List<DailyCarbonSummary> getDailySummaries(User user, LocalDate start, LocalDate end) {
        return dailyRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(user.getId(), start, end);
    }

    public List<WeeklyCarbonSummary> getWeeklySummaries(User user) {
        return weeklyRepository.findByUserIdOrderByYearDescWeekNumberDesc(user.getId());
    }

    public List<MonthlyCarbonSummary> getMonthlySummaries(User user) {
        return monthlyRepository.findByUserIdOrderByYearDescMonthDesc(user.getId());
    }

    public DateRangeAnalyticsResponse getDateRangeAnalytics(User user, LocalDate start, LocalDate end) {
        List<DailyCarbonSummary> summaries = dailyRepository.findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(user.getId(), start, end);

        double totalEmissions = 0.0;
        double transport = 0.0;
        double electricity = 0.0;
        double food = 0.0;
        double shopping = 0.0;
        int totalActivities = 0;
        double totalScoreSum = 0.0;

        double maxEmission = -1.0;
        LocalDate maxDay = null;
        double minEmission = Double.MAX_VALUE;
        LocalDate minDay = null;

        for (DailyCarbonSummary s : summaries) {
            totalEmissions += s.getOverallTotal();
            transport += s.getTransportTotal();
            electricity += s.getElectricityTotal();
            food += s.getFoodTotal();
            shopping += s.getShoppingTotal();
            totalActivities += s.getActivityCount();
            totalScoreSum += s.getSustainabilityScore();

            if (s.getOverallTotal() > maxEmission) {
                maxEmission = s.getOverallTotal();
                maxDay = s.getSummaryDate();
            }
            if (s.getOverallTotal() < minEmission) {
                minEmission = s.getOverallTotal();
                minDay = s.getSummaryDate();
            }
        }

        long daysCount = ChronoUnit.DAYS.between(start, end) + 1;
        double avgDaily = daysCount > 0 ? totalEmissions / daysCount : 0.0;
        double avgScore = summaries.isEmpty() ? 100.0 : totalScoreSum / summaries.size();

        // Calculate trend against previous period
        long periodDays = ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate prevStart = start.minusDays(periodDays);
        LocalDate prevEnd = start.minusDays(1);
        Double prevEmissions = dailyRepository.sumEmissionsInPeriod(user.getId(), prevStart, prevEnd);
        if (prevEmissions == null) prevEmissions = 0.0;

        String trend = "STABLE";
        double diff = totalEmissions - prevEmissions;
        double pctChange = prevEmissions > 0 ? (diff / prevEmissions) * 100.0 : 0.0;
        if (pctChange > 2.0) {
            trend = "INCREASING";
        } else if (pctChange < -2.0) {
            trend = "IMPROVING";
        }

        return DateRangeAnalyticsResponse.builder()
                .totalEmissions(totalEmissions)
                .transportTotal(transport)
                .electricityTotal(electricity)
                .foodTotal(food)
                .shoppingTotal(shopping)
                .averageDailyEmissions(avgDaily)
                .highestEmissionDay(maxDay != null ? maxDay.toString() : "N/A")
                .highestEmissionValue(maxEmission >= 0 ? maxEmission : 0.0)
                .lowestEmissionDay(minDay != null ? minDay.toString() : "N/A")
                .lowestEmissionValue(minEmission < Double.MAX_VALUE ? minEmission : 0.0)
                .activityCount(totalActivities)
                .sustainabilityScore(avgScore)
                .trend(trend)
                .percentageChange(pctChange)
                .build();
    }
}
