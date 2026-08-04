package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class SampleDataService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketMessageRepository ticketMessageRepository;

    @Autowired
    private TicketTimelineRepository ticketTimelineRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private DailyCarbonSummaryRepository dailyRepository;

    @Autowired
    private WeeklyCarbonSummaryRepository weeklyRepository;

    @Autowired
    private MonthlyCarbonSummaryRepository monthlyRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private OrganizationReportRepository organizationReportRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserActivityHistoryRepository userActivityHistoryRepository;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    @Lazy
    private GoalService goalService;

    @Autowired
    @Lazy
    private RecommendationService recommendationService;

    @Autowired
    @Lazy
    private BadgeService badgeService;

    @Autowired
    @Lazy
    private AchievementService achievementService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private OrganizationService organizationService;

    public boolean isDemoDataLoaded() {
        return userRepository.findByEmail("alice@carbontracker.com").isPresent();
    }

    @Transactional
    public void resetAndGenerateDemoData() {
        // Clear all repositories in correct order to prevent FK violations
        organizationReportRepository.deleteAll();
        organizationUserRepository.deleteAll();
        organizationRepository.deleteAll();

        userActivityHistoryRepository.deleteAll();
        auditLogRepository.deleteAll();

        userBadgeRepository.deleteAll();
        achievementRepository.deleteAll();
        certificateRepository.deleteAll();

        notificationRepository.deleteAll();
        recommendationRepository.deleteAll();

        goalRepository.deleteAll();

        dailyRepository.deleteAll();
        weeklyRepository.deleteAll();
        monthlyRepository.deleteAll();

        activityLogRepository.deleteAll();
        ticketTimelineRepository.deleteAll();
        ticketMessageRepository.deleteAll();
        ticketRepository.deleteAll();

        // Delete all users except we'll recreate the admin
        userRepository.deleteAll();

        // Seed default admin account
        User admin = User.builder()
                .fullName("System Admin")
                .email("admin@carbontracker.com")
                .mobileNumber("+1234567890")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);

        // Generate demo dataset
        generateDemoData();
    }

    @Transactional
    public void generateDemoData() {
        LocalDate today = LocalDate.now();

        // 1. Create Users
        User alice = User.builder()
                .fullName("Alice Green")
                .email("alice@carbontracker.com")
                .mobileNumber("+1987654321")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ORG_ADMIN)
                .sustainabilityPreferences("Vegan meal options, public transit commute, solar home heating")
                .country("Sweden")
                .state("Stockholm County")
                .city("Stockholm")
                .gender("Female")
                .dateOfBirth(LocalDate.of(1992, 4, 15))
                .active(true)
                .build();
        alice = userRepository.save(alice);

        User bob = User.builder()
                .fullName("Bob Miller")
                .email("bob@carbontracker.com")
                .mobileNumber("+1555123456")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ORG_USER)
                .sustainabilityPreferences("Active transport, waste reduction, recycling")
                .country("USA")
                .state("New York")
                .city("New York City")
                .gender("Male")
                .dateOfBirth(LocalDate.of(1988, 11, 23))
                .active(true)
                .build();
        bob = userRepository.save(bob);

        User charlie = User.builder()
                .fullName("Charlie Smith")
                .email("charlie@carbontracker.com")
                .mobileNumber("+1555987654")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ORG_USER)
                .sustainabilityPreferences("Energy-efficient appliances")
                .country("USA")
                .state("Texas")
                .city("Houston")
                .gender("Male")
                .dateOfBirth(LocalDate.of(1995, 7, 30))
                .active(true)
                .build();
        charlie = userRepository.save(charlie);

        // 2. Create Organization and Link Members
        Organization org = Organization.builder()
                .organizationName("EcoTech Industries")
                .organizationType("Technology")
                .build();
        org = organizationRepository.save(org);

        OrganizationUser orgUserAlice = OrganizationUser.builder()
                .organization(org)
                .user(alice)
                .role(Role.ORG_ADMIN)
                .build();
        organizationUserRepository.save(orgUserAlice);

        OrganizationUser orgUserBob = OrganizationUser.builder()
                .organization(org)
                .user(bob)
                .role(Role.ORG_USER)
                .build();
        organizationUserRepository.save(orgUserBob);

        OrganizationUser orgUserCharlie = OrganizationUser.builder()
                .organization(org)
                .user(charlie)
                .role(Role.ORG_USER)
                .build();
        organizationUserRepository.save(orgUserCharlie);

        // 3. Generate Historical Logs (Last 90 Days)
        List<ActivityLog> allLogs = new ArrayList<>();

        // Generate logs for Alice (Green Profile)
        for (int i = 90; i >= 0; i--) {
            LocalDate logDate = today.minusDays(i);
            
            // Baseline period (Days -90 to -61): Alice drove a car
            if (i > 60) {
                allLogs.add(createActivityLog(alice, Category.TRANSPORT, "Car Travel", 20.0, logDate));
                allLogs.add(createActivityLog(alice, Category.FOOD, "Chicken Meal", 1.0, logDate));
            } 
            // Performance 1 (Days -60 to -31): Switched to Metro and Vegetarian meals
            else if (i > 30) {
                allLogs.add(createActivityLog(alice, Category.TRANSPORT, "Metro", 25.0, logDate));
                allLogs.add(createActivityLog(alice, Category.FOOD, "Vegetarian Meal", 1.0, logDate));
            } 
            // Performance 2 (Days -30 to -11): Switched to Solar and Vegan meals
            else if (i > 10) {
                allLogs.add(createActivityLog(alice, Category.TRANSPORT, "Train", 15.0, logDate));
                allLogs.add(createActivityLog(alice, Category.FOOD, "Vegan Meal", 1.0, logDate));
                allLogs.add(createActivityLog(alice, Category.ELECTRICITY, "Solar Energy", 15.0, logDate));
            } 
            // Recent Period (Days -10 to today): Vegan meals, Solar energy, and Metro transport
            else {
                allLogs.add(createActivityLog(alice, Category.TRANSPORT, "Metro", 20.0, logDate));
                allLogs.add(createActivityLog(alice, Category.FOOD, "Vegan Meal", 2.0, logDate));
                allLogs.add(createActivityLog(alice, Category.ELECTRICITY, "Solar Energy", 12.0, logDate));
                if (i % 3 == 0) {
                    allLogs.add(createActivityLog(alice, Category.SHOPPING, "Household Products", 20.0, logDate));
                }
            }
            // Electricity and Shopping baselines
            if (i > 10 && i % 2 == 0) {
                allLogs.add(createActivityLog(alice, Category.ELECTRICITY, "Grid Electricity", 15.0, logDate));
            }
            if (i % 7 == 0) {
                allLogs.add(createActivityLog(alice, Category.SHOPPING, "Clothing", 40.0, logDate));
            }
        }

        // Generate logs for Bob (Moderate Profile)
        for (int i = 90; i >= 0; i--) {
            LocalDate logDate = today.minusDays(i);
            // Bob drives car on weekdays, metro on weekends
            if (logDate.getDayOfWeek().getValue() >= 6) {
                allLogs.add(createActivityLog(bob, Category.TRANSPORT, "Bus", 15.0, logDate));
            } else {
                allLogs.add(createActivityLog(bob, Category.TRANSPORT, "Car Travel", 22.0, logDate));
            }
            allLogs.add(createActivityLog(bob, Category.FOOD, "Chicken Meal", 1.5, logDate));
            if (i % 2 == 0) {
                allLogs.add(createActivityLog(bob, Category.ELECTRICITY, "Grid Electricity", 18.0, logDate));
            }
            if (i % 10 == 0) {
                allLogs.add(createActivityLog(bob, Category.SHOPPING, "Clothing", 50.0, logDate));
            }
        }

        // Generate logs for Charlie (High-Emission Profile)
        for (int i = 90; i >= 0; i--) {
            LocalDate logDate = today.minusDays(i);
            allLogs.add(createActivityLog(charlie, Category.TRANSPORT, "Car Travel", 35.0, logDate));
            allLogs.add(createActivityLog(charlie, Category.FOOD, "Beef Meal", 1.5, logDate));
            if (i % 2 == 0) {
                allLogs.add(createActivityLog(charlie, Category.ELECTRICITY, "Grid Electricity", 25.0, logDate));
            }
            if (i % 14 == 0) {
                allLogs.add(createActivityLog(charlie, Category.SHOPPING, "Electronics", 150.0, logDate));
            }
        }

        activityLogRepository.saveAll(allLogs);

        // 4. Create Goals
        // Alice Goals
        // Goal 1: Completed Goal
        Goal aliceGoal1 = Goal.builder()
                .user(alice)
                .goalTitle("Reduce Commute Carbon Footprint")
                .targetReductionPercentage(20.0)
                .startDate(today.minusDays(60))
                .targetDate(today.minusDays(30))
                .currentProgress(0.0)
                .expectedProgress(0.0)
                .variance(0.0)
                .trackStatus("ON_TRACK")
                .status(GoalStatus.ACTIVE)
                .build();
        goalRepository.save(aliceGoal1);

        // Goal 2: Completed Goal
        Goal aliceGoal2 = Goal.builder()
                .user(alice)
                .goalTitle("Eco Friendly Heating & Electricity")
                .targetReductionPercentage(15.0)
                .startDate(today.minusDays(30))
                .targetDate(today.minusDays(10))
                .currentProgress(0.0)
                .expectedProgress(0.0)
                .variance(0.0)
                .trackStatus("ON_TRACK")
                .status(GoalStatus.ACTIVE)
                .build();
        goalRepository.save(aliceGoal2);

        // Goal 3: Active Goal (ON_TRACK)
        Goal aliceGoal3 = Goal.builder()
                .user(alice)
                .goalTitle("Weekday Vegan Diet Challenge")
                .targetReductionPercentage(25.0)
                .startDate(today.minusDays(10))
                .targetDate(today.plusDays(10))
                .currentProgress(0.0)
                .expectedProgress(0.0)
                .variance(0.0)
                .trackStatus("ON_TRACK")
                .status(GoalStatus.ACTIVE)
                .build();
        goalRepository.save(aliceGoal3);

        // Bob Goals
        // Goal 1: Active Goal (ON_TRACK / SLIGHT VARIANCE)
        Goal bobGoal1 = Goal.builder()
                .user(bob)
                .goalTitle("Drive Less, Commute Green")
                .targetReductionPercentage(20.0)
                .startDate(today.minusDays(15))
                .targetDate(today.plusDays(15))
                .currentProgress(0.0)
                .expectedProgress(0.0)
                .variance(0.0)
                .trackStatus("ON_TRACK")
                .status(GoalStatus.ACTIVE)
                .build();
        goalRepository.save(bobGoal1);

        // Charlie Goals
        // Goal 1: Ended / Failed Goal
        Goal charlieGoal1 = Goal.builder()
                .user(charlie)
                .goalTitle("Beef Footprint Limitation")
                .targetReductionPercentage(40.0)
                .startDate(today.minusDays(45))
                .targetDate(today.minusDays(15))
                .currentProgress(0.0)
                .expectedProgress(0.0)
                .variance(0.0)
                .trackStatus("BEHIND_SCHEDULE")
                .status(GoalStatus.ACTIVE)
                .build();
        goalRepository.save(charlieGoal1);

        // Goal 2: Active Goal (BEHIND_SCHEDULE)
        Goal charlieGoal2 = Goal.builder()
                .user(charlie)
                .goalTitle("Reduce Electricity Waste")
                .targetReductionPercentage(25.0)
                .startDate(today.minusDays(5))
                .targetDate(today.plusDays(15))
                .currentProgress(0.0)
                .expectedProgress(0.0)
                .variance(0.0)
                .trackStatus("BEHIND_SCHEDULE")
                .status(GoalStatus.ACTIVE)
                .build();
        goalRepository.save(charlieGoal2);

        // 5. Generate Summaries for Analytics
        // Run daily summaries for all 90 days to populate line/bar trends
        for (int i = 90; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            analyticsService.updateSummariesForUserAndDate(alice, date);
            analyticsService.updateSummariesForUserAndDate(bob, date);
            analyticsService.updateSummariesForUserAndDate(charlie, date);
        }

        // 6. Recalculate Goal Progress (This sets Completed/Failed statuses dynamically based on actual emissions)
        goalService.recalculateGoalsForUser(alice);
        goalService.recalculateGoalsForUser(bob);
        goalService.recalculateGoalsForUser(charlie);

        // 7. Refresh Recommendations and Complete a few of them
        recommendationService.refreshRecommendations(alice);
        recommendationService.refreshRecommendations(bob);
        recommendationService.refreshRecommendations(charlie);

        // Complete 5 recommendations for Alice to trigger certificates and achievements
        List<Recommendation> aliceRecs = recommendationRepository.findByUserId(alice.getId());
        int recsToComplete = 5;
        for (Recommendation r : aliceRecs) {
            if (recsToComplete <= 0) break;
            recommendationService.updateRecommendationStatus(r.getId(), "COMPLETED", alice);
            recsToComplete--;
        }

        // Complete 1 recommendation for Bob
        List<Recommendation> bobRecs = recommendationRepository.findByUserId(bob.getId());
        if (!bobRecs.isEmpty()) {
            recommendationService.updateRecommendationStatus(bobRecs.get(0).getId(), "COMPLETED", bob);
        }

        // 8. Recheck achievements, certificates, and badges via Services
        achievementService.checkAndAwardAchievements(alice);
        achievementService.checkAndAwardAchievements(bob);
        achievementService.checkAndAwardAchievements(charlie);

        // 9. Generate Organization Reports
        // Generate reports for the past 3 months
        int currentMonthVal = today.getMonthValue();
        int currentYearVal = today.getYear();
        for (int m = 3; m >= 1; m--) {
            LocalDate targetMonth = today.minusMonths(m);
            organizationService.generateReport(org.getId(), targetMonth.getMonthValue(), targetMonth.getYear(), alice);
        }

        // 10. Add Search History, Page Views, and Activity History
        List<String> pages = Arrays.asList("Dashboard", "Analytics", "Profile", "Goals", "Recommendations");
        List<String> searches = Arrays.asList("co2 offset", "electric vehicle impact", "vegan footprint savings", "solar heating costs");

        // Log Alice Activities
        auditLogService.logActivity(alice, "LOGIN", "Login Success", "Logged in via Email", "Login Page", null, "Chrome/Windows");
        for (int i = 0; i < pages.size(); i++) {
            auditLogService.logActivity(alice, "VIEW", "Page View", "Viewed page " + pages.get(i), pages.get(i), null, "Chrome/Windows");
        }
        for (String search : searches) {
            auditLogService.logActivity(alice, "SEARCH", "Search Performed", search, "Dashboard", null, "Chrome/Windows");
        }
        auditLogService.logActivity(alice, "DOWNLOAD", "Report Download", "Custom Period PDF Report", "Analytics", null, "Chrome/Windows");

        // Log Bob Activities
        auditLogService.logActivity(bob, "LOGIN", "Login Success", "Logged in via Email", "Login Page", null, "Safari/iPhone");
        auditLogService.logActivity(bob, "VIEW", "Page View", "Viewed page Dashboard", "Dashboard", null, "Safari/iPhone");
        auditLogService.logActivity(bob, "SEARCH", "Search Performed", "hybrid car factors", "Dashboard", null, "Safari/iPhone");

        // Log Charlie Activities
        auditLogService.logActivity(charlie, "LOGIN", "Login Success", "Logged in via Email", "Login Page", null, "Firefox/MacOS");
        auditLogService.logActivity(charlie, "VIEW", "Page View", "Viewed page Dashboard", "Dashboard", null, "Firefox/MacOS");
        auditLogService.logActivity(charlie, "SEARCH", "Search Performed", "carbon reduction calculator", "Dashboard", null, "Firefox/MacOS");
    }

    private ActivityLog createActivityLog(User user, Category category, String activityType, double quantity, LocalDate date) {
        double factorValue = 0.1;
        String unit = "Unit";
        if (category == Category.TRANSPORT) {
            if ("Car Travel".equals(activityType)) { factorValue = 0.18; unit = "Kilometer"; }
            else if ("Motorcycle".equals(activityType)) { factorValue = 0.10; unit = "Kilometer"; }
            else if ("Flight".equals(activityType)) { factorValue = 0.25; unit = "Kilometer"; }
            else if ("Bus".equals(activityType)) { factorValue = 0.08; unit = "Kilometer"; }
            else if ("Train".equals(activityType)) { factorValue = 0.04; unit = "Kilometer"; }
            else if ("Metro".equals(activityType)) { factorValue = 0.03; unit = "Kilometer"; }
        } else if (category == Category.ELECTRICITY) {
            if ("Grid Electricity".equals(activityType)) { factorValue = 0.85; unit = "kWh"; }
            else if ("Solar Energy".equals(activityType)) { factorValue = 0.05; unit = "kWh"; }
            else if ("Renewable Energy".equals(activityType)) { factorValue = 0.02; unit = "kWh"; }
        } else if (category == Category.FOOD) {
            if ("Vegetarian Meal".equals(activityType)) { factorValue = 1.50; unit = "Servings"; }
            else if ("Vegan Meal".equals(activityType)) { factorValue = 0.80; unit = "Servings"; }
            else if ("Chicken Meal".equals(activityType)) { factorValue = 3.00; unit = "Servings"; }
            else if ("Beef Meal".equals(activityType)) { factorValue = 8.00; unit = "Servings"; }
            else if ("Seafood Meal".equals(activityType)) { factorValue = 2.50; unit = "Servings"; }
        } else if (category == Category.SHOPPING) {
            if ("Clothing".equals(activityType)) { factorValue = 0.50; unit = "Currency Spend"; }
            else if ("Electronics".equals(activityType)) { factorValue = 0.90; unit = "Currency Spend"; }
            else if ("Household Products".equals(activityType)) { factorValue = 0.30; unit = "Currency Spend"; }
            else if ("Furniture".equals(activityType)) { factorValue = 0.60; unit = "Currency Spend"; }
        }
        return ActivityLog.builder()
                .user(user)
                .category(category)
                .activityType(activityType)
                .quantity(quantity)
                .unit(unit)
                .emissionFactor(factorValue)
                .carbonEmission(quantity * factorValue)
                .logDate(date)
                .build();
    }
}
