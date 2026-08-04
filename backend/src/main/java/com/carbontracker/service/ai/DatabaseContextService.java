package com.carbontracker.service.ai;

import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DatabaseContextService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserActivityHistoryRepository userActivityHistoryRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    public String getUserContext(User user) {
        if (user == null) return "User Name: Guest\nUser Role: GUEST";

        Long userId = user.getId();
        LocalDate today = LocalDate.now();

        // 1. Today's emissions
        List<ActivityLog> todayLogs = activityLogRepository.findByUserIdAndLogDateBetween(userId, today, today);
        double todayEmissions = todayLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();

        // 2. Yesterday's emissions
        List<ActivityLog> yesterdayLogs = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(1), today.minusDays(1));
        double yesterdayEmissions = yesterdayLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();

        // 3. All-time emissions & last 30 days emissions & averages
        List<ActivityLog> allLogs = activityLogRepository.findByUserIdOrderByLogDateDesc(userId);
        double allTimeTotal = allLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        
        LocalDate thirtyDaysAgo = today.minusDays(30);
        double last30DaysTotal = allLogs.stream()
                .filter(log -> !log.getLogDate().isBefore(thirtyDaysAgo))
                .mapToDouble(ActivityLog::getCarbonEmission)
                .sum();
        
        long logCount = allLogs.size();
        double dailyAverage = logCount > 0 ? (last30DaysTotal / 30.0) : 0.0;

        // 4. Find highest category today (or overall if none today)
        String highestCat = "";
        List<ActivityLog> targetLogs = todayLogs.isEmpty() ? allLogs : todayLogs;
        if (!targetLogs.isEmpty()) {
            Map<String, Double> catTotals = targetLogs.stream()
                    .collect(Collectors.groupingBy(log -> log.getCategory().name(), Collectors.summingDouble(ActivityLog::getCarbonEmission)));
            highestCat = catTotals.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("");
        }

        // 5. Goals count
        List<Goal> goals = goalRepository.findByUserId(userId);
        long activeGoals = goals.stream().filter(g -> GoalStatus.ACTIVE == g.getStatus()).count();

        // 6. Recent audit logs for today/yesterday
        List<UserActivityHistory> recentLogs = userActivityHistoryRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        StringBuilder auditStr = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        if (recentLogs.isEmpty()) {
            auditStr.append("None");
        } else {
            for (UserActivityHistory log : recentLogs) {
                if (log.getCreatedAt().toLocalDate().isAfter(today.minusDays(2))) {
                    String time = log.getCreatedAt().format(formatter);
                    String day = log.getCreatedAt().toLocalDate().isEqual(today) ? "Today" : "Yesterday";
                    auditStr.append(String.format("- [%s %s] %s: %s\n", day, time, log.getActivityType(), log.getActivityName()));
                }
            }
            if (auditStr.length() == 0) {
                auditStr.append("None in last 48 hours");
            }
        }

        return String.format(
                "User Name: %s\n" +
                "User Role: %s\n" +
                "Today's Emissions: %.2f kg CO2e\n" +
                "Yesterday's Emissions: %.2f kg CO2e\n" +
                "Last 30 Days Emissions: %.2f kg CO2e\n" +
                "All-time Emissions: %.2f kg CO2e\n" +
                "Daily Average: %.2f kg CO2e\n" +
                "Total Logs Tracked: %d\n" +
                "Highest Category: %s\n" +
                "Active Goals: %d\n" +
                "Reward Points: %d\n" +
                "Level: %d\n" +
                "Recent Audit Logs:\n%s",
                user.getFullName(),
                user.getRole().name(),
                todayEmissions,
                yesterdayEmissions,
                last30DaysTotal,
                allTimeTotal,
                dailyAverage,
                logCount,
                highestCat.isEmpty() ? "None" : highestCat,
                activeGoals,
                user.getRewardPoints() != null ? user.getRewardPoints() : 0,
                user.getLevel() != null ? user.getLevel() : 1,
                auditStr.toString()
        );
    }

    public String getAdminContext(User admin) {
        if (admin == null) return "User Name: Guest\nUser Role: GUEST";

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        // 1. Get logins today
        List<UserActivityHistory> loginsToday = userActivityHistoryRepository.findByActivityTypeAndCreatedAtAfter("LOGIN", startOfToday);
        
        // Remove duplicate user logins to get unique count
        long activeUsersCount = loginsToday.stream()
                .map(log -> log.getUser().getId())
                .distinct()
                .count();

        StringBuilder loginDetails = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        if (loginsToday.isEmpty()) {
            loginDetails.append("No user logins recorded today.");
        } else {
            // Take up to 10 logins for detailed list
            loginsToday.stream()
                    .collect(Collectors.toMap(
                            log -> log.getUser().getId(),
                            log -> log,
                            (existing, replacement) -> existing.getCreatedAt().isAfter(replacement.getCreatedAt()) ? existing : replacement
                    ))
                    .values()
                    .forEach(log -> {
                        String time = log.getCreatedAt().format(formatter);
                        loginDetails.append(String.format("- **%s** (logged in at %s, IP: %s, Device: %s)\n",
                                log.getUser().getFullName(),
                                time,
                                log.getIpAddress() != null ? log.getIpAddress() : "N/A",
                                log.getDeviceInfo() != null ? log.getDeviceInfo() : "N/A"
                        ));
                    });
        }

        // 2. Platform statistics
        long totalUsers = userRepository.count();
        long pendingTickets = ticketRepository.findAll().stream()
                .filter(t -> "OPEN".equalsIgnoreCase(t.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(t.getStatus()))
                .count();

        return String.format(
                "User Name: %s\n" +
                "User Role: %s\n" +
                "Active Users Logged In Today: %d\n" +
                "User Logins Details:\n%s" +
                "Total Registered Users: %d\n" +
                "Pending Support Tickets: %d",
                admin.getFullName(),
                admin.getRole().name(),
                activeUsersCount,
                loginDetails.toString(),
                totalUsers,
                pendingTickets
        );
    }
}
