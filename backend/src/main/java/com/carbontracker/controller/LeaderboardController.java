package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.LeaderboardSnapshot;
import com.carbontracker.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getLeaderboard() {
        List<LeaderboardResponse> board = leaderboardService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.success(board));
    }

    @GetMapping("/snapshots")
    public ResponseEntity<ApiResponse<List<LeaderboardSnapshot>>> getHistoricalSnapshots(
            @RequestParam int month,
            @RequestParam int year) {
        List<LeaderboardSnapshot> snapshots = leaderboardService.getHistoricalSnapshots(month, year);
        return ResponseEntity.ok(ApiResponse.success(snapshots));
    }

    @PostMapping("/snapshots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> triggerSnapshot(
            @RequestParam int month,
            @RequestParam int year) {
        leaderboardService.generateSnapshot(month, year);
        return ResponseEntity.ok(ApiResponse.success("Monthly snapshot generated successfully", null));
    }
}
