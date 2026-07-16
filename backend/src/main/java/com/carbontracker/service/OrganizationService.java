package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private OrganizationReportRepository organizationReportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public Organization createOrganization(OrganizationRequest request, User creator) {
        Organization organization = Organization.builder()
                .organizationName(request.getOrganizationName())
                .organizationType(request.getOrganizationType())
                .build();

        Organization saved = organizationRepository.save(organization);

        // Bind creator as ORG_ADMIN
        OrganizationUser orgUser = OrganizationUser.builder()
                .organization(saved)
                .user(creator)
                .role(Role.ORG_ADMIN)
                .build();
        organizationUserRepository.save(orgUser);

        // Promote creator's role to ORG_ADMIN if they were USER
        if (creator.getRole() == Role.USER) {
            creator.setRole(Role.ORG_ADMIN);
            userRepository.save(creator);
        }

        auditLogService.log(creator, "CREATE_ORGANIZATION", "Organization", saved.getId(), "Created organization: " + request.getOrganizationName());
        return saved;
    }

    @Transactional
    public OrganizationUser addEmployee(Long orgId, OrganizationUserRequest request, User orgAdmin) {
        // Authorize requester
        validateOrgAdmin(orgId, orgAdmin);

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        User employee = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Employee user not found with email: " + request.getEmail()));

        // Check if already linked
        Optional<OrganizationUser> existing = organizationUserRepository.findByOrganizationIdAndUserId(orgId, employee.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("User is already a member of this organization");
        }

        Role assignedRole = Role.valueOf(request.getRole());
        if (assignedRole != Role.ORG_ADMIN && assignedRole != Role.ORG_USER) {
            throw new IllegalArgumentException("Invalid organization role");
        }

        OrganizationUser orgUser = OrganizationUser.builder()
                .organization(org)
                .user(employee)
                .role(assignedRole)
                .build();

        OrganizationUser saved = organizationUserRepository.save(orgUser);

        // Promote employee role in profile
        if (employee.getRole() == Role.USER) {
            employee.setRole(assignedRole);
            userRepository.save(employee);
        }

        // Notify employee
        notificationService.createNotification(
                employee,
                "Joined Organization: " + org.getOrganizationName(),
                "You have been added as " + assignedRole + " by " + orgAdmin.getFullName(),
                NotificationType.INFO
        );

        auditLogService.log(orgAdmin, "ADD_ORGANIZATION_USER", "OrganizationUser", saved.getId(), "Added user " + employee.getEmail() + " to organization " + org.getOrganizationName());
        return saved;
    }

    public List<OrganizationUser> getEmployees(Long orgId, User admin) {
        validateOrgAdmin(orgId, admin);
        return organizationUserRepository.findByOrganizationId(orgId);
    }

    public double aggregateEmissions(Long orgId, int month, int year, User user) {
        validateOrgMember(orgId, user);

        List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(orgId);
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        double totalEmissions = 0.0;
        for (OrganizationUser member : members) {
            List<ActivityLog> memberLogs = activityLogRepository.findByUserIdAndLogDateBetween(
                    member.getUser().getId(), start, end
            );
            totalEmissions += memberLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        }

        return totalEmissions;
    }

    @Transactional
    public OrganizationReport generateReport(Long orgId, int month, int year, User orgAdmin) {
        validateOrgAdmin(orgId, orgAdmin);

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        double totalEmission = aggregateEmissions(orgId, month, year, orgAdmin);

        OrganizationReport report = OrganizationReport.builder()
                .organization(org)
                .reportMonth(month)
                .reportYear(year)
                .totalEmission(totalEmission)
                .build();

        OrganizationReport savedReport = organizationReportRepository.save(report);

        auditLogService.log(orgAdmin, "GENERATE_ORGANIZATION_REPORT", "OrganizationReport", savedReport.getId(), "Generated monthly report: " + month + "/" + year);

        return savedReport;
    }

    public List<OrganizationReport> getReports(Long orgId, User user) {
        validateOrgMember(orgId, user);
        return organizationReportRepository.findByOrganizationIdOrderByReportYearDescReportMonthDesc(orgId);
    }

    public List<OrganizationUser> getUserOrganizations(User user) {
        return organizationUserRepository.findByUserId(user.getId());
    }

    private void validateOrgAdmin(Long orgId, User user) {
        if (user.getRole() == Role.ADMIN) return; // Platform admin is wildcard
        OrganizationUser member = organizationUserRepository.findByOrganizationIdAndUserId(orgId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of this organization"));

        if (member.getRole() != Role.ORG_ADMIN) {
            throw new IllegalArgumentException("User is not an administrator of this organization");
        }
    }

    private void validateOrgMember(Long orgId, User user) {
        if (user.getRole() == Role.ADMIN) return; // Platform admin is wildcard
        organizationUserRepository.findByOrganizationIdAndUserId(orgId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User is not associated with this organization"));
    }
}
