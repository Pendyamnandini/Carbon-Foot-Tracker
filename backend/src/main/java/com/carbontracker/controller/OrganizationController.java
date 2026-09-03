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
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.carbontracker.service.AuditLogService auditLogService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Organization>> createOrganization(@Valid @RequestBody OrganizationRequest request) {
        User creator = getCurrentUser();
        Organization org = organizationService.createOrganization(request, creator);
        auditLogService.logActivity(creator, "CREATE", "Organization Created", "Created organization " + org.getOrganizationName(), "Organization Dashboard", null, null);
        return ResponseEntity.ok(ApiResponse.success("Organization created successfully", org));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrganizationUser>>> getMyOrganizations() {
        User user = getCurrentUser();
        List<OrganizationUser> list = organizationService.getUserOrganizations(user);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<OrganizationUser>> getMyOrganization() {
        User user = getCurrentUser();
        List<OrganizationUser> list = organizationService.getUserOrganizations(user);
        if (list.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("No organization found"));
        }
        return ResponseEntity.ok(ApiResponse.success(list.get(0)));
    }

    @GetMapping("/{orgId}/activities")
    public ResponseEntity<ApiResponse<List<OrgActivityResponse>>> getActivities(
            @PathVariable Long orgId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String activityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long employeeId) {
        
        User admin = getCurrentUser();
        List<OrgActivityResponse> activities = organizationService.getActivities(orgId, admin, category, activityType, startDate, endDate, employeeId);
        return ResponseEntity.ok(ApiResponse.success(activities));
    }

    @PostMapping("/{orgId}/employees")
    public ResponseEntity<ApiResponse<OrganizationUser>> addEmployee(
            @PathVariable Long orgId,
            @Valid @RequestBody OrganizationUserRequest request) {
        User orgAdmin = getCurrentUser();
        OrganizationUser employee = organizationService.addEmployee(orgId, request, orgAdmin);
        auditLogService.logActivity(orgAdmin, "CREATE", "Employee Added", "Added employee " + request.getEmail() + " to organization", "Organization Dashboard", null, null);
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
        auditLogService.logActivity(orgAdmin, "CREATE", "Organization Report Created", "Generated aggregated report for " + month + "/" + year, "Organization Dashboard", null, null);
        return ResponseEntity.ok(ApiResponse.success("Report generated successfully", report));
    }

    @GetMapping("/{orgId}/reports")
    public ResponseEntity<ApiResponse<List<OrganizationReport>>> getReports(
            @PathVariable Long orgId) {
        User user = getCurrentUser();
        List<OrganizationReport> reports = organizationService.getReports(orgId, user);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/fix-my-role")
    public ResponseEntity<ApiResponse<String>> fixMyRole() {
        User user = getCurrentUser();
        user.setRole(com.carbontracker.entity.Role.ORG_USER);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Role fixed", null));
    }
    
    @jakarta.annotation.PostConstruct
    public void fixNandiniRole() {
        userRepository.findAll().forEach(u -> {
            if (u.getEmail().toLowerCase().contains("nandu")) {
                u.setRole(com.carbontracker.entity.Role.ORG_USER);
                userRepository.save(u);
                System.out.println("FIXED ROLE FOR: " + u.getEmail());
            }
        });
    }

    @GetMapping("/dump-users-debug")
    public ResponseEntity<List<String>> dumpUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
            .map(u -> u.getEmail() + " : " + u.getRole())
            .toList());
    }

    @GetMapping("/{orgId}/employee-trends")
    public ResponseEntity<ApiResponse<List<EmployeeTrendResponse>>> getEmployeeTrends(
            @PathVariable Long orgId) {
        User admin = getCurrentUser();
        List<EmployeeTrendResponse> trends = organizationService.getEmployeeTrends(orgId, admin);
        return ResponseEntity.ok(ApiResponse.success(trends));
    }

    @GetMapping("/{orgId}/department-performance")
    public ResponseEntity<ApiResponse<List<DepartmentPerformanceResponse>>> getDepartmentPerformance(
            @PathVariable Long orgId) {
        User admin = getCurrentUser();
        List<DepartmentPerformanceResponse> performance = organizationService.getDepartmentPerformance(orgId, admin);
        return ResponseEntity.ok(ApiResponse.success(performance));
    }

    @GetMapping("/{orgId}/team-rankings")
    public ResponseEntity<ApiResponse<List<TeamRankingResponse>>> getTeamRankings(
            @PathVariable Long orgId) {
        User admin = getCurrentUser();
        List<TeamRankingResponse> rankings = organizationService.getTeamRankings(orgId, admin);
        return ResponseEntity.ok(ApiResponse.success(rankings));
    }
}
