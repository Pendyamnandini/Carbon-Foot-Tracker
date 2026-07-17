package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class UserActivityV1Controller {

    @Autowired
    private UserActivityHistoryRepository userActivityHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping("/user/activity-history")
    public ResponseEntity<ApiResponse<Page<UserActivityHistory>>> getActivityHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(userActivityHistoryRepository.findByUserId(user.getId(), pageable)));
    }

    @GetMapping("/user/recent-activities")
    public ResponseEntity<ApiResponse<RecentActivitiesResponse>> getRecentActivities() {
        User user = getCurrentUser();
        
        List<UserActivityHistory> last10 = userActivityHistoryRepository.findTop10ByUserIdOrderByCreatedAtDesc(user.getId());

        LocalDateTime lastLogin = userActivityHistoryRepository.findFirstByUserIdAndActivityTypeOrderByCreatedAtDesc(user.getId(), "LOGIN")
                .map(UserActivityHistory::getCreatedAt)
                .orElse(null);

        LocalDateTime lastActive = last10.isEmpty() ? null : last10.get(0).getCreatedAt();

        String lastSearch = userActivityHistoryRepository.findFirstByUserIdAndActivityTypeOrderByCreatedAtDesc(user.getId(), "SEARCH")
                .map(UserActivityHistory::getActivityDescription)
                .orElse("No recent searches");

        String lastDownload = userActivityHistoryRepository.findFirstByUserIdAndActivityTypeOrderByCreatedAtDesc(user.getId(), "DOWNLOAD")
                .map(UserActivityHistory::getActivityDescription)
                .orElse("No recent downloads");

        String lastRecommendation = userActivityHistoryRepository.findFirstByUserIdAndActivityTypeOrderByCreatedAtDesc(user.getId(), "VIEW")
                .stream()
                .filter(a -> a.getActivityName().contains("Recommendation"))
                .map(UserActivityHistory::getActivityDescription)
                .findFirst()
                .orElse("No recommendations viewed recently");

        RecentActivitiesResponse response = RecentActivitiesResponse.builder()
                .lastLoginTime(lastLogin)
                .lastActiveTime(lastActive)
                .last10Activities(last10)
                .lastSearchedAnalytics(lastSearch)
                .lastDownloadedReport(lastDownload)
                .lastViewedRecommendation(lastRecommendation)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/user/search-history")
    public ResponseEntity<ApiResponse<Page<UserActivityHistory>>> getSearchHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(userActivityHistoryRepository.findByUserIdAndActivityType(user.getId(), "SEARCH", pageable)));
    }

    @GetMapping("/admin/user-activity-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserActivityHistory>>> getAdminUserActivityHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(userActivityHistoryRepository.findAll(pageable)));
    }

    @GetMapping("/admin/user-login-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserActivityHistory>>> getAdminUserLoginHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(userActivityHistoryRepository.findAllLogins(pageable)));
    }

    @GetMapping("/admin/activity-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminActivityStatsResponse>> getAdminActivityStats() {
        Pageable limit5 = PageRequest.of(0, 5);
        
        List<Object[]> activeUsersRaw = userActivityHistoryRepository.findMostActiveUsersLimit(limit5);
        List<AdminActivityStatsResponse.StatItem> activeUsers = activeUsersRaw.stream()
                .map(row -> new AdminActivityStatsResponse.StatItem((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());

        List<Object[]> visitedPagesRaw = userActivityHistoryRepository.findMostVisitedPagesLimit(limit5);
        List<AdminActivityStatsResponse.StatItem> visitedPages = visitedPagesRaw.stream()
                .map(row -> new AdminActivityStatsResponse.StatItem((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());

        List<Object[]> downloadedReportsRaw = userActivityHistoryRepository.findMostDownloadedReportsLimit(limit5);
        List<AdminActivityStatsResponse.StatItem> downloadedReports = downloadedReportsRaw.stream()
                .map(row -> new AdminActivityStatsResponse.StatItem((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());

        AdminActivityStatsResponse response = AdminActivityStatsResponse.builder()
                .mostActiveUsers(activeUsers)
                .mostVisitedPages(visitedPages)
                .mostDownloadedReports(downloadedReports)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
