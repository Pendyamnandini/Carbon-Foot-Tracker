package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.Comparator;
import java.util.stream.Collectors;

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

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @PostConstruct
    public void seedDemoOrganization() {
        Optional<User> optUser = userRepository.findByEmail("organizer@carbontracker.com");
        if (optUser.isPresent()) {
            User user = optUser.get();
            List<OrganizationUser> orgs = organizationUserRepository.findByUserId(user.getId());
            if (orgs.isEmpty()) {
                Organization org = Organization.builder()
                        .organizationName("Propelloitte Technologies")
                        .organizationType("Business")
                        .build();
                org = organizationRepository.save(org);
                
                OrganizationUser ou = OrganizationUser.builder()
                        .organization(org)
                        .user(user)
                        .role(Role.ORG_ADMIN)
                        .build();
                organizationUserRepository.save(ou);
            }
        }
    }

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
        if (user.getRole() == Role.ADMIN) {
            List<Organization> orgs = organizationRepository.findAll();
            return orgs.stream().map(o -> OrganizationUser.builder()
                .organization(o)
                .user(user)
                .role(Role.ADMIN)
                .build()).collect(Collectors.toList());
        }
        return organizationUserRepository.findByUserId(user.getId());
    }

    public List<OrgActivityResponse> getActivities(Long orgId, User admin, String category, String activityType, LocalDate startDate, LocalDate endDate, Long employeeId) {
        validateOrgAdmin(orgId, admin);
        List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(orgId);
        
        List<OrgActivityResponse> allActivities = new ArrayList<>();
        
        for (OrganizationUser member : members) {
            if (employeeId != null && !member.getUser().getId().equals(employeeId)) {
                continue;
            }
            List<ActivityLog> logs;
            if (startDate != null && endDate != null) {
                logs = activityLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateDesc(member.getUser().getId(), startDate, endDate);
            } else {
                logs = activityLogRepository.findByUserIdOrderByLogDateDesc(member.getUser().getId());
            }

            for (ActivityLog log : logs) {
                if (category != null && !category.isEmpty() && !log.getCategory().name().equalsIgnoreCase(category)) {
                    continue;
                }
                if (activityType != null && !activityType.isEmpty() && !log.getActivityType().toLowerCase().contains(activityType.toLowerCase())) {
                    continue;
                }
                
                allActivities.add(OrgActivityResponse.builder()
                        .id(log.getId())
                        .userName(member.getUser().getFullName())
                        .userEmail(member.getUser().getEmail())
                        .category(log.getCategory().name())
                        .activityType(log.getActivityType())
                        .quantity(log.getQuantity())
                        .unit(log.getUnit())
                        .carbonEmission(log.getCarbonEmission())
                        .logDate(log.getLogDate())
                        .createdAt(log.getCreatedAt())
                        .build());
            }
        }
        
        // Sort by logDate desc
        allActivities.sort(Comparator.comparing(OrgActivityResponse::getLogDate).reversed());
        return allActivities;
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

    public List<com.carbontracker.dto.EmployeeTrendResponse> getEmployeeTrends(Long orgId, User admin) {
        validateOrgAdmin(orgId, admin);
        List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(orgId);
        LocalDate today = LocalDate.now();
        List<com.carbontracker.dto.EmployeeTrendResponse> list = new java.util.ArrayList<>();
        for (OrganizationUser member : members) {
            List<com.carbontracker.dto.AdminDashboardV1Response.TimeValue> trend = new java.util.ArrayList<>();
            for (int i = 5; i >= 0; i--) {
                LocalDate start = today.withDayOfMonth(1).minusMonths(i);
                LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
                double sum = activityLogRepository.findByUserIdAndLogDateBetween(member.getUser().getId(), start, end).stream()
                        .mapToDouble(ActivityLog::getCarbonEmission).sum();
                String label = start.getMonth().name().substring(0, 3) + " " + start.getYear();
                trend.add(new com.carbontracker.dto.AdminDashboardV1Response.TimeValue(label, Math.round(sum * 10.0)/10.0));
            }
            list.add(com.carbontracker.dto.EmployeeTrendResponse.builder()
                    .employeeId(member.getUser().getId())
                    .employeeName(member.getUser().getFullName())
                    .emissionsOverTime(trend)
                    .build());
        }
        return list;
    }

    public List<com.carbontracker.dto.DepartmentPerformanceResponse> getDepartmentPerformance(Long orgId, User admin) {
        validateOrgAdmin(orgId, admin);
        List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(orgId);
        
        Map<String, List<User>> deptMap = new java.util.HashMap<>();
        String[] depts = {"Sales", "Engineering", "Marketing", "HR", "Operations"};
        for (OrganizationUser m : members) {
            String dept = depts[(int)(m.getUser().getId() % depts.length)];
            deptMap.computeIfAbsent(dept, k -> new java.util.ArrayList<>()).add(m.getUser());
        }

        List<com.carbontracker.dto.DepartmentPerformanceResponse> response = new java.util.ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        for (Map.Entry<String, List<User>> entry : deptMap.entrySet()) {
            String deptName = entry.getKey();
            List<User> users = entry.getValue();
            double total = 0.0;
            for (User u : users) {
                total += activityLogRepository.findByUserIdAndLogDateBetween(u.getId(), startOfMonth, endOfMonth).stream()
                        .mapToDouble(ActivityLog::getCarbonEmission).sum();
            }
            double avg = users.isEmpty() ? 0.0 : total / users.size();
            response.add(com.carbontracker.dto.DepartmentPerformanceResponse.builder()
                    .departmentName(deptName)
                    .employeeCount(users.size())
                    .totalEmissions(Math.round(total * 10.0)/10.0)
                    .averageEmissions(Math.round(avg * 10.0)/10.0)
                    .build());
        }
        return response;
    }

    public List<com.carbontracker.dto.TeamRankingResponse> getTeamRankings(Long orgId, User admin) {
        validateOrgAdmin(orgId, admin);
        List<OrganizationUser> members = organizationUserRepository.findByOrganizationId(orgId);
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        List<com.carbontracker.dto.TeamRankingResponse> list = new java.util.ArrayList<>();
        String[] depts = {"Sales", "Engineering", "Marketing", "HR", "Operations"};

        List<User> allUsers = userRepository.findAll();
        double totalPlat = 0.0;
        int activePlat = 0;
        for (User u : allUsers) {
            double em = activityLogRepository.findByUserIdAndLogDateBetween(u.getId(), startOfMonth, endOfMonth).stream()
                    .mapToDouble(ActivityLog::getCarbonEmission).sum();
            if (em > 0) {
                totalPlat += em;
                activePlat++;
            }
        }
        double platAvg = activePlat == 0 ? 0.0 : totalPlat / activePlat;

        List<UserBadge> allUserBadges = userBadgeRepository.findAll();
        List<Goal> allGoals = goalRepository.findAll();

        for (OrganizationUser m : members) {
            double em = activityLogRepository.findByUserIdAndLogDateBetween(m.getUser().getId(), startOfMonth, endOfMonth).stream()
                    .mapToDouble(ActivityLog::getCarbonEmission).sum();
            String dept = depts[(int)(m.getUser().getId() % depts.length)];

            long badgesCount = allUserBadges.stream().filter(ub -> ub.getUser().getId().equals(m.getUser().getId())).count();
            long compGoals = allGoals.stream().filter(g -> g.getUser().getId().equals(m.getUser().getId()) && g.getStatus() == GoalStatus.COMPLETED).count();

            double score = 50.0 + (badgesCount * 10.0) + (compGoals * 15.0);
            if (platAvg > 0) {
                score -= (em / platAvg) * 20.0;
            }
            score = Math.max(0.0, Math.min(100.0, score));

            list.add(com.carbontracker.dto.TeamRankingResponse.builder()
                    .employeeName(m.getUser().getFullName())
                    .department(dept)
                    .emissions(Math.round(em * 10.0)/10.0)
                    .sustainabilityScore(Math.round(score * 10.0)/10.0)
                    .build());
        }

        list.sort(Comparator.comparingDouble(com.carbontracker.dto.TeamRankingResponse::getEmissions));
        for (int i = 0; i < list.size(); i++) {
            list.get(i).setRank(i + 1);
        }
        return list;
    }
}
