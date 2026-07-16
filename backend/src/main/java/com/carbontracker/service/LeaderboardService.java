package com.carbontracker.service;

import com.carbontracker.dto.LeaderboardResponse;
import com.carbontracker.entity.*;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.LeaderboardSnapshotRepository;
import com.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class LeaderboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private LeaderboardSnapshotRepository snapshotRepository;

    public List<LeaderboardResponse> getLeaderboard() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now(); // current day

        List<User> users = userRepository.findAll();
        List<LeaderboardResponse> board = new ArrayList<>();

        for (User user : users) {
            if (!user.isActive()) continue;

            List<ActivityLog> logs = activityLogRepository.findByUserIdAndLogDateBetween(
                    user.getId(), startOfMonth, LocalDate.now()
            );

            double monthlyEmission = logs.stream()
                    .mapToDouble(ActivityLog::getCarbonEmission)
                    .sum();

            board.add(LeaderboardResponse.builder()
                    .userId(user.getId())
                    .userName(user.getFullName())
                    .profileImageUrl(user.getProfileImageUrl())
                    .carbonEmission(monthlyEmission)
                    .build());
        }

        // Sort ascending (lowest carbon emission is first)
        board.sort(Comparator.comparingDouble(LeaderboardResponse::getCarbonEmission));

        for (int i = 0; i < board.size(); i++) {
            board.get(i).setRankPosition(i + 1);
        }

        return board;
    }

    public List<LeaderboardSnapshot> getHistoricalSnapshots(int month, int year) {
        return snapshotRepository.findByMonthAndYearOrderByRankPositionAsc(month, year);
    }

    @Transactional
    public void generateSnapshot(int month, int year) {
        // Fetch current ranks
        List<LeaderboardResponse> activeBoard = getLeaderboard();

        for (LeaderboardResponse entry : activeBoard) {
            User user = userRepository.findById(entry.getUserId()).orElse(null);
            if (user == null) continue;

            LeaderboardSnapshot snapshot = LeaderboardSnapshot.builder()
                    .user(user)
                    .rankPosition(entry.getRankPosition())
                    .score(entry.getCarbonEmission())
                    .month(month)
                    .year(year)
                    .build();

            snapshotRepository.save(snapshot);
        }
    }

    // Schedule: Runs on the 1st of every month at 1:00 AM
    @Scheduled(cron = "0 0 1 1 * *")
    @Transactional
    public void runMonthlySnapshotJob() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        generateSnapshot(lastMonth.getMonthValue(), lastMonth.getYear());
    }
}
