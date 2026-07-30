package com.carbontracker.controller;

import com.carbontracker.dto.ApiResponse;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import com.carbontracker.service.AchievementService;
import com.carbontracker.service.BadgeService;
import com.carbontracker.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AchievementController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private AchievementService achievementService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private CertificateRepository certificateRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<List<Achievement>>> getAchievements() {
        User user = getCurrentUser();
        // Check for any updates first
        achievementService.checkAndAwardAchievements(user);
        return ResponseEntity.ok(ApiResponse.success(achievementService.getAchievementsForUser(user)));
    }

    @GetMapping("/certificates")
    public ResponseEntity<ApiResponse<List<Certificate>>> getCertificates() {
        User user = getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(achievementService.getCertificatesForUser(user)));
    }

    @GetMapping("/certificates/verify")
    public ResponseEntity<ApiResponse<Certificate>> verifyCertificate(@RequestParam String certificateId) {
        Optional<Certificate> cert = certificateRepository.findByCertificateId(certificateId);
        if (cert.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Certificate not found"));
        }
        return ResponseEntity.ok(ApiResponse.success(cert.get()));
    }

    @GetMapping("/rewards")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRewards() {
        User user = getCurrentUser();
        int points = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
        int level = user.getLevel() != null ? user.getLevel() : 1;
        int progress = points % 100;
        long rank = userRepository.countByRewardPointsGreaterThan(points) + 1;

        Map<String, Object> response = new HashMap<>();
        response.put("totalPoints", points);
        response.put("level", level);
        response.put("progressToNextLevel", progress);
        response.put("currentRank", rank);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/badges")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBadges() {
        User user = getCurrentUser();
        
        // Refresh badges first
        badgeService.checkAndAwardBadges(user);

        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(user.getId());
        Set<Long> unlockedBadgeIds = userBadges.stream()
                .map(ub -> ub.getBadge().getId())
                .collect(Collectors.toSet());

        // Gather metrics to calculate progress for locked badges
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        List<Goal> goals = goalRepository.findByUserId(user.getId());
        List<Recommendation> completedRecs = recommendationRepository.findByUserIdAndStatus(user.getId(), "COMPLETED");

        int logsCount = logs.size();
        long completedGoals = goals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
        int recsCompleted = completedRecs.size();
        
        // Calculate streak
        Set<LocalDate> uniqueDates = new TreeSet<>(Comparator.reverseOrder());
        for (ActivityLog log : logs) {
            uniqueDates.add(log.getLogDate());
        }
        int currentStreak = 0;
        LocalDate current = null;
        for (LocalDate date : uniqueDates) {
            if (current == null) {
                current = date;
                currentStreak = 1;
            } else {
                if (date.equals(current.minusDays(1))) {
                    currentStreak++;
                    current = date;
                } else if (!date.equals(current)) {
                    break;
                }
            }
        }

        // Saved CO2
        double totalSaved = 0.0;
        if (recommendationService != null) {
            totalSaved = recommendationService.getCompletedMonthlySavings(user);
        }
        for (Goal g : goals) {
            if (g.getStatus() == GoalStatus.COMPLETED) {
                LocalDate start = g.getStartDate();
                LocalDate target = g.getTargetDate();
                long days = java.time.temporal.ChronoUnit.DAYS.between(start, target) + 1;
                LocalDate baselineStart = start.minusDays(30);
                List<ActivityLog> baselineLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), baselineStart, start.minusDays(1));
                double dailyBaseline = baselineLogs.isEmpty() ? 25.0 : (baselineLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum() / 30.0);
                List<ActivityLog> activeLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), start, target);
                double totalActive = activeLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                double saved = (dailyBaseline * days) - totalActive;
                if (saved > 0) {
                    totalSaved += saved;
                }
            }
        }

        final double finalTotalSaved = totalSaved;
        final int finalStreak = currentStreak;

        List<Map<String, Object>> unlockedList = new ArrayList<>();
        List<Map<String, Object>> lockedList = new ArrayList<>();

        for (Badge badge : allBadges) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", badge.getId());
            map.put("badgeName", badge.getBadgeName());
            map.put("description", badge.getDescription());
            map.put("category", badge.getCategory());
            map.put("imageUrl", badge.getImageUrl());
            map.put("criteria", badge.getCriteria());

            if (unlockedBadgeIds.contains(badge.getId())) {
                UserBadge ub = userBadges.stream().filter(u -> u.getBadge().getId().equals(badge.getId())).findFirst().orElse(null);
                map.put("dateEarned", ub != null ? ub.getAwardedDate() : null);
                unlockedList.add(map);
            } else {
                // Calculate progress percentage
                double progress = 0.0;
                String name = badge.getBadgeName();
                if (name.contains("Beginner") || name.contains("Starter")) {
                    progress = logsCount >= 1 ? 100.0 : 0.0;
                } else if (name.contains("7-Day")) {
                    progress = Math.min((finalStreak / 7.0) * 100.0, 100.0);
                } else if (name.contains("30-Day")) {
                    progress = Math.min((finalStreak / 30.0) * 100.0, 100.0);
                } else if (name.contains("First Goal")) {
                    progress = completedGoals >= 1 ? 100.0 : 0.0;
                } else if (name.contains("Warrior")) {
                    progress = Math.min((completedGoals / 3.0) * 100.0, 100.0);
                } else if (name.contains("10 kg") || name.contains("10kg")) {
                    progress = Math.min((finalTotalSaved / 10.0) * 100.0, 100.0);
                } else if (name.contains("25 kg") || name.contains("25kg")) {
                    progress = Math.min((finalTotalSaved / 25.0) * 100.0, 100.0);
                } else if (name.contains("50 kg") || name.contains("50kg")) {
                    progress = Math.min((finalTotalSaved / 50.0) * 100.0, 100.0);
                } else if (name.contains("Champion")) {
                    progress = Math.min((finalTotalSaved / 100.0) * 100.0, 100.0);
                } else if (name.contains("Master")) {
                    progress = Math.min((recsCompleted / 5.0) * 100.0, 100.0);
                } else if (name.contains("Hero")) {
                    int pts = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
                    progress = Math.min((pts / 1000.0) * 100.0, 100.0);
                } else {
                    progress = 0.0;
                }
                map.put("progress", Math.round(progress));
                lockedList.add(map);
            }
        }

        Map<String, Object> data = new HashMap<>();
        data.put("unlockedBadges", unlockedList);
        data.put("lockedBadges", lockedList);

        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
