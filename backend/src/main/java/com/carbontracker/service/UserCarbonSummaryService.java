package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.UserCarbonSummaryRepository;
import com.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Optional;

@Service
public class UserCarbonSummaryService {

    @Autowired
    private UserCarbonSummaryRepository summaryRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void updateSummaryForUserAndDate(User user, LocalDate date) {
        WeekFields weekFields = WeekFields.ISO;
        int weekNumber = date.get(weekFields.weekOfWeekBasedYear());
        int month = date.getMonthValue();
        int year = date.getYear();

        // Calculate start and end date for that specific week
        LocalDate startOfWeek = date.with(weekFields.dayOfWeek(), 1);
        LocalDate endOfWeek = date.with(weekFields.dayOfWeek(), 7);

        List<ActivityLog> weeklyLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), startOfWeek, endOfWeek);

        double transportTotal = 0.0;
        double electricityTotal = 0.0;
        double foodTotal = 0.0;
        double shoppingTotal = 0.0;

        for (ActivityLog log : weeklyLogs) {
            switch (log.getCategory()) {
                case TRANSPORT -> transportTotal += log.getCarbonEmission();
                case ELECTRICITY -> electricityTotal += log.getCarbonEmission();
                case FOOD -> foodTotal += log.getCarbonEmission();
                case SHOPPING -> shoppingTotal += log.getCarbonEmission();
            }
        }

        double overallTotal = transportTotal + electricityTotal + foodTotal + shoppingTotal;

        Optional<UserCarbonSummary> summaryOpt = summaryRepository.findByUserIdAndWeekNumberAndMonthAndYear(
                user.getId(), weekNumber, month, year
        );

        UserCarbonSummary summary;
        if (summaryOpt.isPresent()) {
            summary = summaryOpt.get();
            summary.setTransportTotal(transportTotal);
            summary.setElectricityTotal(electricityTotal);
            summary.setFoodTotal(foodTotal);
            summary.setShoppingTotal(shoppingTotal);
            summary.setOverallTotal(overallTotal);
        } else {
            summary = UserCarbonSummary.builder()
                    .user(user)
                    .weekNumber(weekNumber)
                    .month(month)
                    .year(year)
                    .transportTotal(transportTotal)
                    .electricityTotal(electricityTotal)
                    .foodTotal(foodTotal)
                    .shoppingTotal(shoppingTotal)
                    .overallTotal(overallTotal)
                    .build();
        }

        summaryRepository.save(summary);
    }

    // Run scheduled aggregation daily (e.g. at 1 AM)
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void dailyUpdateSummaries() {
        LocalDate today = LocalDate.now();
        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                updateSummaryForUserAndDate(user, today);
            } catch (Exception e) {
                System.err.println("Daily summary update failed for user " + user.getId() + ": " + e.getMessage());
            }
        }
    }

    // Run scheduled aggregation weekly (e.g. Sunday 2 AM)
    @Scheduled(cron = "0 0 2 * * SUN")
    @Transactional
    public void weeklyRecalculateTotals() {
        LocalDate lastWeek = LocalDate.now().minusWeeks(1);
        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                updateSummaryForUserAndDate(user, lastWeek);
            } catch (Exception e) {
                System.err.println("Weekly summary recalculation failed for user " + user.getId() + ": " + e.getMessage());
            }
        }
    }

    // Run scheduled aggregation monthly (e.g. 1st of month at 3 AM)
    @Scheduled(cron = "0 0 3 1 * *")
    @Transactional
    public void monthlyGenerateHistoricalSummaries() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        List<User> users = userRepository.findAll();
        for (User user : users) {
            try {
                updateSummaryForUserAndDate(user, lastMonth);
            } catch (Exception e) {
                System.err.println("Monthly historical summary generation failed for user " + user.getId() + ": " + e.getMessage());
            }
        }
    }
}
