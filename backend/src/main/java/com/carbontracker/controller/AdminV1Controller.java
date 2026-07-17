package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.service.AdminV1Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminV1Controller {

    @Autowired
    private AdminV1Service adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardV1Response>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAdminDashboardStats()));
    }

    @GetMapping("/user-analytics")
    public ResponseEntity<ApiResponse<AdminUserAnalyticsResponse>> getUserAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserAnalytics()));
    }

    @GetMapping("/emission-analytics")
    public ResponseEntity<ApiResponse<AdminEmissionAnalyticsResponse>> getEmissionAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getEmissionAnalytics()));
    }

    @GetMapping("/category-analytics")
    public ResponseEntity<ApiResponse<AdminCategoryAnalyticsResponse>> getCategoryAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCategoryAnalytics()));
    }
}
