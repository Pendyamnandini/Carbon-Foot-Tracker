package com.carbontracker.controller;

import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import com.carbontracker.service.ExportV1Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/exports")
public class ExportV1Controller {

    @Autowired
    private ExportV1Service exportService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.carbontracker.service.AuditLogService auditLogService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping("/user")
    public ResponseEntity<?> exportUserReport(
            @RequestParam(defaultValue = "pdf") String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = getCurrentUser();
        auditLogService.logActivity(user, "DOWNLOAD", "User Sustainability Report", "Downloaded user sustainability report in " + format + " format", "Dashboard", null, null);
        if ("csv".equalsIgnoreCase(format)) {
            String csv = exportService.generateUserCsv(user, startDate, endDate);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"carbon_report_" + user.getId() + ".csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv);
        } else {
            byte[] pdfBytes = exportService.generateUserPdf(user, startDate, endDate);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"carbon_report_" + user.getId() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        }
    }

    @GetMapping("/organization")
    public ResponseEntity<?> exportOrgReport(
            @RequestParam Long orgId,
            @RequestParam(defaultValue = "pdf") String format) {
        User user = getCurrentUser();
        
        // Validate user is associated with organization
        if (user.getRole() != Role.ADMIN) {
            organizationUserRepository.findByOrganizationIdAndUserId(orgId, user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Access Denied: You are not associated with this organization"));
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        auditLogService.logActivity(user, "DOWNLOAD", "Organization Sustainability Report", "Downloaded organization sustainability report in " + format + " format", "Organization Dashboard", null, null);

        if ("csv".equalsIgnoreCase(format)) {
            String csv = exportService.generateOrgCsv(org, user);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"org_report_" + orgId + ".csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv);
        } else {
            byte[] pdfBytes = exportService.generateOrgPdf(org, user);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"org_report_" + orgId + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        }
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> exportAnalyticsReport(@RequestParam(defaultValue = "pdf") String format) {
        User user = getCurrentUser();
        auditLogService.logActivity(user, "DOWNLOAD", "Platform Analytics Report", "Downloaded platform analytics report in " + format + " format", "Admin Dashboard", null, null);
        if ("csv".equalsIgnoreCase(format)) {
            String csv = exportService.generateAnalyticsCsv();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"platform_analytics.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv);
        } else {
            byte[] pdfBytes = exportService.generateAnalyticsPdf();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"platform_analytics.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        }
    }
}
