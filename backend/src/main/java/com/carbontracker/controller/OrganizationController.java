package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Organization>> createOrganization(@Valid @RequestBody OrganizationRequest request) {
        User creator = getCurrentUser();
        Organization org = organizationService.createOrganization(request, creator);
        return ResponseEntity.ok(ApiResponse.success("Organization created successfully", org));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrganizationUser>>> getMyOrganizations() {
        User user = getCurrentUser();
        List<OrganizationUser> list = organizationService.getUserOrganizations(user);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{orgId}/employees")
    public ResponseEntity<ApiResponse<OrganizationUser>> addEmployee(
            @PathVariable Long orgId,
            @Valid @RequestBody OrganizationUserRequest request) {
        User orgAdmin = getCurrentUser();
        OrganizationUser employee = organizationService.addEmployee(orgId, request, orgAdmin);
        return ResponseEntity.ok(ApiResponse.success("Employee added successfully", employee));
    }

    @GetMapping("/{orgId}/employees")
    public ResponseEntity<ApiResponse<List<OrganizationUser>>> getEmployees(
            @PathVariable Long orgId) {
        User user = getCurrentUser();
        List<OrganizationUser> employees = organizationService.getEmployees(orgId, user);
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @PostMapping("/{orgId}/reports")
    public ResponseEntity<ApiResponse<OrganizationReport>> generateReport(
            @PathVariable Long orgId,
            @RequestParam int month,
            @RequestParam int year) {
        User orgAdmin = getCurrentUser();
        OrganizationReport report = organizationService.generateReport(orgId, month, year, orgAdmin);
        return ResponseEntity.ok(ApiResponse.success("Report generated successfully", report));
    }

    @GetMapping("/{orgId}/reports")
    public ResponseEntity<ApiResponse<List<OrganizationReport>>> getReports(
            @PathVariable Long orgId) {
        User user = getCurrentUser();
        List<OrganizationReport> reports = organizationService.getReports(orgId, user);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }
}
