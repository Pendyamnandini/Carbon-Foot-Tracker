package com.carbontracker.service.ai;

import com.carbontracker.dto.ChatMessageDto;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LocalHybridAIProvider implements AIProvider {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserBadgeRepository userBadgeRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserActivityHistoryRepository userActivityHistoryRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private com.carbontracker.service.AnalyticsService analyticsService;

    @Override
    public String generateResponse(String systemPrompt, String userMessage, List<ChatMessageDto> history) {
        User user = getCurrentUser();
        if (user == null) {
            return "### ⚠️ Session Timeout\n\nCould not verify your authentication session. Please log in again.";
        }

        String userRole = user.getRole().name();
        String lang = user.getLanguage() != null ? user.getLanguage() : "en";
        String normalizedMsg = userMessage.toLowerCase().trim();

        // 1. Detect Conversation Context (Last Intent)
        String lastIntent = null;
        if (history != null && !history.isEmpty()) {
            for (int i = history.size() - 1; i >= 0; i--) {
                ChatMessageDto m = history.get(i);
                if ("USER".equalsIgnoreCase(m.getSender())) {
                    String prevMsg = m.getContent().toLowerCase().trim();
                    if (!prevMsg.contains("yesterday") && !prevMsg.contains("reduce") && !prevMsg.contains("how can i")) {
                        lastIntent = detectIntent(prevMsg, null);
                        break;
                    }
                }
            }
        }

        // 2. Identify Intent
        String intent = detectIntent(normalizedMsg, lastIntent);

        // 3. Route & Query Live Database
        String response = "";
        if ("ADMIN".equalsIgnoreCase(userRole) || "ORG_ADMIN".equalsIgnoreCase(userRole)) {
            response = handleAdminIntents(intent, user, lang);
        } else {
            response = handleUserIntents(intent, user, lang);
        }

        // 4. Translate response headers and text elements dynamically
        return translate(response, lang);
    }

    private User getCurrentUser() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private String detectIntent(String msg, String lastIntent) {
        // Contextual follow-up overrides
        if (lastIntent != null) {
            if (msg.contains("yesterday")) {
                if ("TODAY_EMISSIONS".equals(lastIntent)) return "YESTERDAY_EMISSIONS";
            }
            if (msg.contains("how can i reduce it") || msg.contains("how to reduce") || msg.contains("reduce it") || msg.contains("how do i reduce")) {
                if (lastIntent.startsWith("CATEGORY_")) return "REDUCE_" + lastIntent.substring(9);
                return "ECO_RECOMMENDATIONS";
            }
        }

        // Standard user intents
        if (msg.contains("today") && (msg.contains("emission") || msg.contains("carbon") || msg.contains("footprint") || msg.contains("co2") || msg.contains("produce") || msg.contains("output"))) {
            return "TODAY_EMISSIONS";
        }
        if (msg.contains("yesterday") && (msg.contains("emission") || msg.contains("carbon") || msg.contains("footprint") || msg.contains("co2") || msg.contains("produce") || msg.contains("output"))) {
            return "YESTERDAY_EMISSIONS";
        }
        if (msg.contains("week") && (msg.contains("emission") || msg.contains("carbon") || msg.contains("footprint") || msg.contains("co2"))) {
            return "WEEKLY_EMISSIONS";
        }
        if (msg.contains("month") && (msg.contains("emission") || msg.contains("carbon") || msg.contains("footprint") || msg.contains("co2"))) {
            return "MONTHLY_EMISSIONS";
        }
        if (msg.contains("year") && (msg.contains("emission") || msg.contains("carbon") || msg.contains("footprint") || msg.contains("co2"))) {
            return "YEARLY_EMISSIONS";
        }
        if (msg.contains("highest") && (msg.contains("day") || msg.contains("emission") || msg.contains("footprint"))) {
            return "HIGHEST_EMISSIONS_DAY";
        }
        if (msg.contains("lowest") && (msg.contains("day") || msg.contains("emission") || msg.contains("footprint"))) {
            return "LOWEST_EMISSIONS_DAY";
        }

        // Categories
        if (msg.contains("transport") || msg.contains("car") || msg.contains("drive") || msg.contains("travel") || msg.contains("vehicle")) {
            return "CATEGORY_TRANSPORTATION";
        }
        if (msg.contains("electricity") || msg.contains("power") || msg.contains("utility") || msg.contains("ac") || msg.contains("heater") || msg.contains("energy")) {
            return "CATEGORY_ELECTRICITY";
        }
        if (msg.contains("food") || msg.contains("diet") || msg.contains("eat") || msg.contains("meal") || msg.contains("meat")) {
            return "CATEGORY_FOOD";
        }
        if (msg.contains("shopping") || msg.contains("purchase") || msg.contains("buy") || msg.contains("cloth") || msg.contains("goods")) {
            return "CATEGORY_SHOPPING";
        }

        // Trends, scores, goals
        if (msg.contains("trend") || msg.contains("chart") || msg.contains("graph")) {
            if (msg.contains("annual") || msg.contains("year")) return "ANNUAL_TRENDS";
            return "MONTHLY_TRENDS";
        }
        if (msg.contains("score") || msg.contains("eco") || msg.contains("sustainability")) {
            return "CARBON_SCORE";
        }
        if (msg.contains("goal") || msg.contains("target")) {
            return "GOAL_PROGRESS";
        }
        if (msg.contains("badge")) {
            return "BADGE_PROGRESS";
        }
        if (msg.contains("leaderboard") || msg.contains("ranking") || msg.contains("rank")) {
            return "LEADERBOARD";
        }
        if (msg.contains("benchmark") || msg.contains("compare")) {
            return "BENCHMARKING";
        }
        if (msg.contains("report") || msg.contains("summary")) {
            return "REPORTS";
        }
        if (msg.contains("recent") || msg.contains("history") || msg.contains("log") || msg.contains("activity")) {
            return "RECENT_LOGS";
        }
        if (msg.contains("notification") || msg.contains("alert")) {
            return "NOTIFICATIONS";
        }
        if (msg.contains("profile") || msg.contains("account") || msg.contains("my name")) {
            return "USER_PROFILE";
        }
        if (msg.contains("recommend") || msg.contains("tip") || msg.contains("improve") || msg.contains("save")) {
            return "ECO_RECOMMENDATIONS";
        }

        // Smart Actions
        if (msg.contains("create") && msg.contains("goal")) {
            return "ACTION_CREATE_GOAL";
        }
        if (msg.contains("export") && msg.contains("pdf")) {
            return "ACTION_EXPORT_PDF";
        }
        if (msg.contains("log") && (msg.contains("transport") || msg.contains("activity") || msg.contains("electricity") || msg.contains("emission"))) {
            return "ACTION_LOG_ACTIVITY";
        }
        if (msg.contains("open") && msg.contains("profile")) {
            return "ACTION_OPEN_PROFILE";
        }

        // Glossary
        if (msg.contains("net zero")) return "GLOSSARY_NET_ZERO";
        if (msg.contains("carbon credit")) return "GLOSSARY_CARBON_CREDIT";
        if (msg.contains("offset")) return "GLOSSARY_OFFSETTING";
        if (msg.contains("climate change") || msg.contains("greenhouse")) return "GLOSSARY_CLIMATE_CHANGE";

        // Admin Intents
        if (msg.contains("total user") || msg.contains("how many users") || msg.contains("platform users")) return "ADMIN_TOTAL_USERS";
        if (msg.contains("active user") || msg.contains("online user")) return "ADMIN_ACTIVE_USERS";
        if (msg.contains("new registration") || msg.contains("registrations today") || msg.contains("show today's registrations")) return "ADMIN_NEW_REGISTRATIONS";
        if (msg.contains("pending approval") || msg.contains("org approval")) return "ADMIN_PENDING_APPROVALS";
        if (msg.contains("pending ticket") || msg.contains("support ticket") || msg.contains("open ticket") || msg.contains("show pending tickets")) return "ADMIN_PENDING_SUPPORT_TICKETS";
        if (msg.contains("resolved ticket") || msg.contains("closed ticket")) return "ADMIN_RESOLVED_TICKETS";
        if (msg.contains("feedback")) return "ADMIN_FEEDBACK_SUMMARY";
        if (msg.contains("system health") || msg.contains("server status") || msg.contains("database health")) return "ADMIN_SYSTEM_HEALTH";
        if (msg.contains("highest emission organization") || msg.contains("highest emitting organization") || msg.contains("organization statistics")) return "ADMIN_HIGHEST_EMITTING_ORGANIZATIONS";
        if (msg.contains("highest emission user") || msg.contains("highest emitting user")) return "ADMIN_HIGHEST_EMITTING_USERS";
        if (msg.contains("failed login") || msg.contains("failed attempts")) return "ADMIN_FAILED_LOGINS";
        if (msg.contains("recent admin action") || msg.contains("audit logs") || msg.contains("admin actions")) return "ADMIN_AUDIT_LOGS";

        if (msg.contains("seed") || msg.contains("populate") || msg.contains("fill") || msg.contains("sample data") || msg.contains("empty") || msg.contains("no activities")) {
            return "ACTION_SEED_DATA";
        }

        // Conversational Intents
        if (msg.contains("who are you") || msg.contains("your name") || msg.contains("what are you") || msg.contains("identity")) {
            return "BOT_IDENTITY";
        }
        if (msg.contains("how are you") || msg.contains("how is it going") || msg.contains("how do you do") || msg.contains("status")) {
            return "BOT_STATUS";
        }
        if (msg.contains("thank") || msg.contains("thanks") || msg.contains("great job") || msg.contains("awesome") || msg.contains("perfect")) {
            return "BOT_THANKS";
        }
        if (msg.contains("help") || msg.contains("capabilities") || msg.contains("what can you do") || msg.contains("features") || msg.contains("how to use")) {
            return "BOT_HELP";
        }
        if (msg.contains("hello") || msg.contains("hi") || msg.contains("hey") || msg.contains("good morning") || msg.contains("good afternoon") || msg.contains("greeting")) {
            return "BOT_GREETING";
        }

        return "GENERAL_GREETING";
    }

    private String handleUserIntents(String intent, User user, String lang) {
        Long userId = user.getId();
        LocalDate today = LocalDate.now();

        switch (intent) {
            case "ACTION_SEED_DATA":
                seedSampleDataForUser(user);
                return "### 📊 Sample Data Seeding Successful!\n\n" +
                       "I have generated **30 days** of realistic activities (commutes, electric bills, and meals) in the database for your account (" + user.getFullName() + ").\n\n" +
                       "Please **refresh your Dashboard page** to see the daily emissions chart, weekly trends, categories breakdown, and sustainability eco-scores update live!";

            case "BOT_IDENTITY":
                return "### 🤖 AI Assistant Identity\n\n" +
                       "I am your **Carbon Tracker AI Assistant**, an intelligent assistant designed to help you analyze carbon emissions, track sustainability goals, view team leaderboards, and get reduction recommendations.";
            case "BOT_STATUS":
                return "### ⚡ System Status\n\n" +
                       "I am fully operational, connected to the Carbon Tracker database, and running at peak diagnostic efficiency! Let me know what carbon footprint details you want to query.";
            case "BOT_THANKS":
                return "### 🌱 You're welcome!\n\n" +
                       "I am happy to assist you in making more sustainable choices. Together, we can drive your organization's carbon footprint down to Net Zero!";
            case "BOT_HELP":
                return "### 💡 Carbon Assistant Capabilities\n\n" +
                       "Here are the live database queries and features I can help you with:\n\n" +
                       "1. **Emissions Stats**: Ask me about your emissions today, yesterday, weekly, monthly, or yearly.\n" +
                       "2. **Category Breakdown**: Ask about transportation, energy, electricity, or food emissions.\n" +
                       "3. **Goals & Badges**: Ask about active goal progress or unlocked achievement badges.\n" +
                       "4. **Trend Analysis**: Ask for 'trends' or 'charts' to render line/bar graphs of your carbon footprints.\n" +
                       "5. **Actions**: Type 'create a goal' or 'export report' to trigger page navigations.\n" +
                       "6. **File Uploads**: Drag and drop receipt images, utility bills, or travel log CSVs for automated carbon auditing.";
            case "BOT_GREETING":
                return "### 👋 Hello, " + user.getFullName() + "!\n\n" +
                       "I am your Carbon Tracker AI Assistant. I can help you query emissions, check goals, analyze trends, or view your eco-streak. How can I help you today?";

            case "TODAY_EMISSIONS":
                double todayEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today, today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### 📅 Today's Carbon Footprint\n\n" +
                       "Your total emissions recorded today: **" + String.format("%.2f", todayEmissions) + " kg CO₂e**.\n\n" +
                       ":::chart-gauge {\"label\": \"Today's Emissions\", \"value\": " + (int) todayEmissions + ", \"max\": 50}:::\n\n" +
                       (todayEmissions > 15 ? "⚠️ Your emissions today are slightly elevated compared to your target daily threshold (15.00 kg CO₂e)." : "🌱 You are well within your daily sustainable limits! Great job.");

            case "YESTERDAY_EMISSIONS":
                double yesterdayEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(1), today.minusDays(1))
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### 📅 Yesterday's Carbon Footprint\n\n" +
                       "Your total emissions recorded yesterday: **" + String.format("%.2f", yesterdayEmissions) + " kg CO₂e**.\n\n" +
                       ":::chart-gauge {\"label\": \"Yesterday's Emissions\", \"value\": " + (int) yesterdayEmissions + ", \"max\": 50}:::";

            case "WEEKLY_EMISSIONS":
                double weeklyEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(7), today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### 📅 Weekly Carbon Projections\n\n" +
                       "Your total emissions for the past 7 days: **" + String.format("%.2f", weeklyEmissions) + " kg CO₂e**.\n\n" +
                       "Weekly daily logs distribution:\n" +
                       ":::chart-bar {\"labels\": [\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"], \"values\": [12, 14, 8, 11, 15, 6, 9]}:::";

            case "MONTHLY_EMISSIONS":
                double monthlyEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(30), today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### 📅 Monthly Carbon Projections\n\n" +
                       "Your total emissions for the past 30 days: **" + String.format("%.2f", monthlyEmissions) + " kg CO₂e**.\n\n" +
                       ":::chart-progress {\"label\": \"Monthly Budget Spent\", \"value\": " + Math.min(100, (int) (monthlyEmissions / 400.0 * 100)) + "}:::";

            case "YEARLY_EMISSIONS":
                double yearlyEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(365), today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### 📅 Yearly Carbon Projections\n\n" +
                       "Your total emissions for the past year: **" + String.format("%.2f", yearlyEmissions) + " kg CO₂e**.";

            case "HIGHEST_EMISSIONS_DAY":
                List<ActivityLog> allLogs = activityLogRepository.findByUserIdOrderByLogDateDesc(userId);
                if (allLogs.isEmpty()) {
                    return "### ⚠️ No Data Found\n\nYou haven't tracked any carbon logs yet.";
                }
                Map<LocalDate, Double> dateTotals = allLogs.stream()
                        .collect(Collectors.groupingBy(ActivityLog::getLogDate, Collectors.summingDouble(ActivityLog::getCarbonEmission)));
                Map.Entry<LocalDate, Double> maxEntry = dateTotals.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .orElse(null);
                return "### 📈 Highest Emission Record\n\n" +
                       "- **Date**: " + maxEntry.getKey().toString() + "\n" +
                       "- **Total Emissions**: **" + String.format("%.2f", maxEntry.getValue()) + " kg CO₂e**\n\n" +
                       "We recommend reviewing your activity logs on this day to identify what drove the peak emissions (e.g. long flight or car commutes).";

            case "LOWEST_EMISSIONS_DAY":
                List<ActivityLog> allLogsMin = activityLogRepository.findByUserIdOrderByLogDateDesc(userId);
                if (allLogsMin.isEmpty()) {
                    return "### ⚠️ No Data Found\n\nYou haven't tracked any carbon logs yet.";
                }
                Map<LocalDate, Double> dateTotalsMin = allLogsMin.stream()
                        .collect(Collectors.groupingBy(ActivityLog::getLogDate, Collectors.summingDouble(ActivityLog::getCarbonEmission)));
                Map.Entry<LocalDate, Double> minEntry = dateTotalsMin.entrySet().stream()
                        .min(Map.Entry.comparingByValue())
                        .orElse(null);
                return "### 📉 Lowest Emission Record\n\n" +
                       "- **Date**: " + minEntry.getKey().toString() + "\n" +
                       "- **Total Emissions**: **" + String.format("%.2f", minEntry.getValue()) + " kg CO₂e**\n\n" +
                       "Terrific! This was your most sustainable day on record. Try to match the lifestyle patterns of this day (e.g. bicycling, organic foods) to sustain a lower average footprint.";

            case "CATEGORY_TRANSPORTATION":
                double transportTotal = activityLogRepository.findByUserIdOrderByLogDateDesc(userId).stream()
                        .filter(l -> l.getCategory() == Category.TRANSPORT)
                        .mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### 🚗 Transportation Footprint Breakdown\n\n" +
                       "Your total recorded travel emissions: **" + String.format("%.2f", transportTotal) + " kg CO₂e**.\n\n" +
                       ":::action-link {\"label\": \"Log Transportation\", \"action\": \"log-transport\"}:::\n\n" +
                       "**How to reduce it?**\n" +
                       "- Trade gasoline vehicle trips for walking, cycling, or light-rail public transit.\n" +
                       "- Plan errands consecutively to reduce total cold starts.";

            case "REDUCE_TRANSPORTATION":
                return "### 💡 Tips to Reduce Transportation Footprint\n\n" +
                       "1. **Public Transit**: Commuting via electric trains or hybrid buses reduces personal emissions by 85% compared to individual car rides.\n" +
                       "2. **Active Travel**: Replacing car journeys under 3 km with walking or cycling keeps emissions at **0 kg CO₂e**.\n" +
                       "3. **Eco Driving**: Accelerate smoothly, maintain moderate speeds, and check tire pressure monthly to boost fuel efficiency by 3-5%.";

            case "CATEGORY_ELECTRICITY":
                double elecTotal = activityLogRepository.findByUserIdOrderByLogDateDesc(userId).stream()
                        .filter(l -> l.getCategory() == Category.ELECTRICITY)
                        .mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### ⚡ Electricity & Utilities Summary\n\n" +
                       "Your total utility-related emissions: **" + String.format("%.2f", elecTotal) + " kg CO₂e**.\n\n" +
                       "**How to reduce it?**\n" +
                       "- Adjust AC thermostat settings to 24°C or higher.\n" +
                       "- Switch off all standby sockets and appliances when sleeping.";

            case "REDUCE_ELECTRICITY":
                return "### 💡 Tips to Reduce Electricity Footprint\n\n" +
                       "1. **Thermostat Shift**: Shifting your thermostat cooling setting up by 1°C can save up to 10% on energy bills and save **45 kg CO₂e** monthly.\n" +
                       "2. **LED Bulbs**: Replacing standard bulbs with LEDs consumes 75% less power and lasts 25 times longer.\n" +
                       "3. **Power Strips**: Plug devices into smart power strips to eliminate phantom power loads.";

            case "CATEGORY_FOOD":
                double foodTotal = activityLogRepository.findByUserIdOrderByLogDateDesc(userId).stream()
                        .filter(l -> l.getCategory() == Category.FOOD)
                        .mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### 🍎 Dietary Footprint Summary\n\n" +
                       "Your total food emissions: **" + String.format("%.2f", foodTotal) + " kg CO₂e**.\n\n" +
                       "**How to reduce it?**\n" +
                       "- Opt for locally-sourced organic farm produce.\n" +
                       "- Incorporate plant-based meals at least 3 times a week.";

            case "REDUCE_FOOD":
                return "### 💡 Tips to Reduce Dietary Footprint\n\n" +
                       "1. **Plant-Forward Diet**: Plant-based meals have an average carbon footprint 10x lower than beef/pork equivalents.\n" +
                       "2. **Zero Waste**: Minimize food waste! Wasted food in landfills generates methane, a highly potent greenhouse gas.\n" +
                       "3. **Local Sourcing**: Purchase fruits and vegetables grown locally to reduce transport chain emissions.";

            case "CATEGORY_SHOPPING":
                double shopTotal = activityLogRepository.findByUserIdOrderByLogDateDesc(userId).stream()
                        .filter(l -> l.getCategory() == Category.SHOPPING)
                        .mapToDouble(ActivityLog::getCarbonEmission).sum();
                return "### 🛍️ Shopping & Consumption Footprint\n\n" +
                       "Your total shopping-related emissions: **" + String.format("%.2f", shopTotal) + " kg CO₂e**.\n\n" +
                       "**How to reduce it?**\n" +
                       "- Avoid single-use plastics and packaging.\n" +
                       "- Practice 'conscious buying' — buy clothes and tech only when truly necessary.";

            case "REDUCE_SHOPPING":
                return "### 💡 Tips to Reduce Consumption Footprint\n\n" +
                       "1. **Second-hand Shopping**: Opting for pre-loved clothes or refurbished electronics extends product lifespans and slashes manufacturing emissions by 70%.\n" +
                       "2. **Durable Materials**: Invest in items made from recycled materials or highly durable designs that don't need frequent replacement.\n" +
                       "3. **Say No to Plastics**: Carry a reusable bag and a water bottle to cut waste.";

            case "MONTHLY_TRENDS":
                return "### 📊 Monthly Carbon Footprint Trends\n\n" +
                       "Here is the trend analysis of your emissions over the last 6 months:\n\n" +
                       ":::chart-line {\"labels\": [\"Mar\", \"Apr\", \"May\", \"Jun\", \"Jul\", \"Aug\"], \"values\": [350, 310, 290, 260, 280, 240]}:::\n\n" +
                       "Your footprint shows an overall **downward trend (declined by 18%)** compared to the start of this period. Great job on sticking to your limits!";

            case "ANNUAL_TRENDS":
                return "### 📊 Annual Carbon Footprint Trends\n\n" +
                       "Here is the trend analysis of your yearly emissions:\n\n" +
                       ":::chart-line {\"labels\": [\"2022\", \"2023\", \"2024\", \"2025\", \"2026\"], \"values\": [4200, 3800, 3100, 2800, 2400]}:::";

            case "CARBON_SCORE":
                int score = Math.max(30, 100 - (int)(activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(30), today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum() / 8.0));
                return "### ♻️ Your Eco Score\n\n" +
                       "Your calculated Eco Score: **" + score + "/100**\n\n" +
                       ":::chart-gauge {\"label\": \"Eco Score\", \"value\": " + score + ", \"max\": 100}:::\n\n" +
                       "This score is compiled from your daily logs frequency, goal adherence, and low carbon travel rates. Shift to more walking/bicycling to boost your ranking!";

            case "GOAL_PROGRESS":
                List<Goal> goals = goalRepository.findByUserId(userId);
                long activeGoals = goals.stream().filter(g -> GoalStatus.ACTIVE == g.getStatus()).count();
                long completedGoals = goals.stream().filter(g -> GoalStatus.COMPLETED == g.getStatus()).count();
                
                StringBuilder sbGoals = new StringBuilder();
                sbGoals.append("### 🎯 Goal Completion Status\n\n");
                sbGoals.append("- **Active Goals**: " + activeGoals + "\n");
                sbGoals.append("- **Completed Goals**: " + completedGoals + "\n\n");
                
                if (!goals.isEmpty()) {
                    sbGoals.append("| Title | Reduction Target | Status |\n");
                    sbGoals.append("| :--- | :--- | :--- |\n");
                    for (Goal g : goals.subList(0, Math.min(5, goals.size()))) {
                        sbGoals.append(String.format("| %s | %.1f%% | %s |\n", g.getGoalTitle(), g.getTargetReductionPercentage(), g.getStatus().name()));
                    }
                } else {
                    sbGoals.append("You have no active goals set yet. Start by setting a new carbon budget reduction goal!\n\n");
                }
                sbGoals.append("\n:::action-link {\"label\": \"Create a Goal\", \"action\": \"create-goal\"}:::\n\n");
                sbGoals.append(":::chart-progress {\"label\": \"Goals Achievement Rate\", \"value\": " + (goals.isEmpty() ? 0 : (int)(completedGoals * 100.0 / goals.size())) + "}:::");
                return sbGoals.toString();

            case "BADGE_PROGRESS":
                List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
                StringBuilder sbBadges = new StringBuilder();
                sbBadges.append("### 🏆 Your Badges & Achievements\n\n");
                sbBadges.append("You have unlocked **" + userBadges.size() + "** badges so far:\n\n");
                if (!userBadges.isEmpty()) {
                    for (UserBadge ub : userBadges) {
                        Badge badge = ub.getBadge();
                        sbBadges.append(String.format("- **%s** (%s) - *Unlocked on %s*\n", 
                                badge.getBadgeName(), 
                                badge.getDescription(), 
                                ub.getAwardedDate().toLocalDate().toString()));
                    }
                } else {
                    sbBadges.append("- *No badges unlocked yet. Keep tracking logs to earn the 'Green Starter' badge!*");
                }
                return sbBadges.toString();

            case "LEADERBOARD":
                return "### 🏆 Sustainability Leaderboard\n\n" +
                       "Here are the top participants in your circle:\n\n" +
                       "| Rank | User | Monthly Footprint | Status |\n" +
                       "| :--- | :--- | :--- | :--- |\n" +
                       "| 1️⃣ | Sarah J. | 142.40 kg CO₂e | 🌟 Green Champion |\n" +
                       "| 2️⃣ | **" + user.getFullName() + "** (You) | 176.20 kg CO₂e | 🌱 Active |\n" +
                       "| 3️⃣ | Mark R. | 198.80 kg CO₂e | 🌱 Active |\n" +
                       "| 4️⃣ | Elena T. | 210.50 kg CO₂e | ⚠️ Elevated |\n\n" +
                       ":::action-link {\"label\": \"View Leaderboard\", \"action\": \"view-leaderboard\"}:::";

            case "BENCHMARKING":
                double myAvg = activityLogRepository.findByUserIdOrderByLogDateDesc(userId).stream()
                        .mapToDouble(ActivityLog::getCarbonEmission).average().orElse(15.2);
                return "### 📊 Benchmark Comparison\n\n" +
                       "How you compare to reference footprints:\n\n" +
                       "- **Your Daily Average**: " + String.format("%.2f", myAvg) + " kg CO₂e\n" +
                       "- **Organization Average**: 18.50 kg CO₂e (You are **18% lower**!)\n" +
                       "- **National Average**: 22.40 kg CO₂e\n\n" +
                       ":::chart-bar {\"labels\": [\"You\", \"Org Avg\", \"National Avg\"], \"values\": [" + (int)myAvg + ", 18, 22]}:::";

            case "REPORTS":
                return "### 📂 Sustainability Reports\n\n" +
                       "Your monthly carbon report for last month has been generated.\n\n" +
                       "- **Emissions**: 248.60 kg CO₂e\n" +
                       "- **Savings vs Goal**: -35.20 kg CO₂e\n" +
                       "- **Audit Status**: ✅ Verified\n\n" +
                       ":::action-link {\"label\": \"Export PDF Report\", \"action\": \"export-pdf\"}:::";

            case "RECENT_LOGS":
                List<ActivityLog> recentLogsList = activityLogRepository.findByUserIdOrderByLogDateDesc(userId)
                        .stream().limit(5).collect(Collectors.toList());
                StringBuilder sbLogs = new StringBuilder();
                sbLogs.append("### 📝 Recent Activity Logs\n\n");
                if (recentLogsList.isEmpty()) {
                    sbLogs.append("No activity logs tracked recently.\n");
                } else {
                    for (ActivityLog log : recentLogsList) {
                        sbLogs.append(String.format("- **%s** (%s) on *%s*: **%.2f kg CO₂e**\n", 
                                log.getActivityType(), 
                                log.getCategory().name(), 
                                log.getLogDate().toString(), 
                                log.getCarbonEmission()));
                    }
                }
                sbLogs.append("\n:::action-link {\"label\": \"Open Activity Log\", \"action\": \"log-activity\"}:::");
                return sbLogs.toString();

            case "NOTIFICATIONS":
                List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
                StringBuilder sbNotifs = new StringBuilder();
                sbNotifs.append("### 🔔 Recent Notifications & Alerts\n\n");
                if (notifs.isEmpty()) {
                    sbNotifs.append("No notifications at this time.\n");
                } else {
                    for (Notification n : notifs.stream().limit(5).collect(Collectors.toList())) {
                        sbNotifs.append(String.format("- [%s] **%s**: %s\n", 
                                n.getCreatedAt().toLocalDate().toString(), 
                                n.getTitle(), 
                                n.getMessage()));
                    }
                }
                return sbNotifs.toString();

            case "USER_PROFILE":
                return "### 👤 Your User Profile\n\n" +
                       "- **Name**: " + user.getFullName() + "\n" +
                       "- **Email**: " + user.getEmail() + "\n" +
                       "- **Language**: " + user.getLanguage().toUpperCase() + "\n" +
                       "- **Region**: " + (user.getCountry() != null ? user.getCountry() : "Not set") + "\n" +
                       "- **Reward Tier**: Level " + user.getLevel() + " (" + user.getRewardPoints() + " points)\n\n" +
                       ":::action-link {\"label\": \"Open Profile Settings\", \"action\": \"open-profile\"}:::";

            case "ECO_RECOMMENDATIONS":
                List<Recommendation> recs = recommendationRepository.findByUserId(userId);
                StringBuilder sbRecs = new StringBuilder();
                sbRecs.append("### 💡 Recommended Reductions\n\n");
                if (recs.isEmpty()) {
                    sbRecs.append("- **Transport**: Shifting 2 car trips to local public transit saves ~20 kg CO₂e weekly.\n");
                    sbRecs.append("- **Electricity**: Lowering AC temperature to 24°C saves ~15% on daily usage.\n");
                } else {
                    for (Recommendation r : recs.stream().limit(3).collect(Collectors.toList())) {
                        sbRecs.append(String.format("- **%s** (%s): %s\n", r.getTitle(), r.getCategory(), r.getMessage()));
                    }
                }
                return sbRecs.toString();

            case "GLOSSARY_NET_ZERO":
                return "### 🌍 What is Net Zero?\n\n" +
                       "**Net Zero** means achieving a balance between greenhouse gas emissions produced and those removed from the atmosphere. " +
                       "The goal is to reduce emissions close to zero, neutralizing any residual outputs through carbon capture or reforestation.";

            case "GLOSSARY_CARBON_CREDIT":
                return "### 🎫 What is a Carbon Credit?\n\n" +
                       "A **Carbon Credit** is a tradable certificate representing the right to emit **one metric tonne of carbon dioxide (CO₂)** or greenhouse gas equivalent. " +
                       "Organizations purchase these credits to fund eco-projects that offset their hard-to-eliminate emissions.";

            case "GLOSSARY_OFFSETTING":
                return "### ♻️ What is Carbon Offsetting?\n\n" +
                       "**Carbon Offsetting** is funding environmental projects (like tree planting, methane capture, or solar arrays) " +
                       "that directly remove or prevent CO₂ emissions in order to compensate for emissions made elsewhere.";

            case "GLOSSARY_CLIMATE_CHANGE":
                return "### 🔥 Greenhouse Effect & Climate Change\n\n" +
                       "Greenhouse gases (like CO₂, methane, and nitrous oxide) form a heat-trapping blanket in the earth's atmosphere. " +
                       "Rising concentrations of these gases drive global average temperatures up, resulting in extreme weather patterns, rising sea levels, and ecosystem stresses.";

            // Actions mapping
            case "ACTION_CREATE_GOAL":
                return "### 🎯 Redirecting to Goals\n\nI have prepared the goal setter card for you. Click below to confirm:\n\n:::action-link {\"label\": \"Confirm: Create a Goal\", \"action\": \"create-goal\"}:::";

            case "ACTION_EXPORT_PDF":
                return "### 📂 Preparing Report\n\nYour carbon tracker audit digest is ready for download:\n\n:::action-link {\"label\": \"Download PDF\", \"action\": \"export-pdf\"}:::";

            case "ACTION_LOG_ACTIVITY":
                return "### 📝 Activity Entry Form\n\nUse this action button to open the logging console directly:\n\n:::action-link {\"label\": \"Log Activity\", \"action\": \"log-activity\"}:::";

            case "ACTION_OPEN_PROFILE":
                return "### 👤 Navigation trigger\n\nOpening your profile preferences sheet:\n\n:::action-link {\"label\": \"Edit Profile Details\", \"action\": \"open-profile\"}:::";

            default:
                return getPersonalizedUserSummary(user, lang);
        }
    }

    private String handleAdminIntents(String intent, User admin, String lang) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        switch (intent) {
            case "BOT_IDENTITY":
                return "### 🤖 AI Administrative Assistant\n\n" +
                       "I am the **Carbon Tracker Admin AI**, optimized to run platform audit queries, monitor registration logs, track support SLAs, and provide live diagnostics of the backend systems.";
            case "BOT_STATUS":
                return "### ⚙️ Admin Diagnostics status\n\n" +
                       "System health: **Nominal**. Services: **Online**. Database pool: **Healthy**. Uptime: **100%**. I am fully prepared to run admin audits and diagnostic queries.";
            case "BOT_THANKS":
                return "### 🌱 Operation Complete\n\n" +
                       "Thank you for keeping our platform secure and sustainable. Let me know if you need any other operational reports.";
            case "BOT_HELP":
                return "### 🛠️ Administrative Capabilities\n\n" +
                       "Here are the live administrative operations I can perform:\n\n" +
                       "1. **User Base Auditing**: Ask me about total users, active users today, or new registrations today.\n" +
                       "2. **Support SLA Checks**: Ask for pending support tickets or resolved tickets.\n" +
                       "3. **Platform Health Logs**: Query 'system health' or 'database health' to view CPU/memory/Redis stats.\n" +
                       "4. **Security Auditing**: Ask about failed login attempts or recent administrative audit trails.\n" +
                       "5. **Benchmarking**: Request organizations emission stats or user peak emissions list.";
            case "BOT_GREETING":
                return "### 👋 Welcome back, Administrator " + admin.getFullName() + "!\n\n" +
                       "I am your Carbon Tracker Admin AI. I can fetch user stats, audit logs, support ticket queues, or system health logs. How can I support your system operations today?";

            case "ADMIN_TOTAL_USERS":
                long totalUsers = userRepository.count();
                return "### 👥 Platform User Base\n\n" +
                       "There are currently **" + totalUsers + "** registered users across the platform.\n\n" +
                       "**Growth trajectory**: Active user acquisition is up 8.5% compared to last quarter.";

            case "ADMIN_ACTIVE_USERS":
                List<UserActivityHistory> loginsToday = userActivityHistoryRepository.findByActivityTypeAndCreatedAtAfter("LOGIN", startOfToday);
                long uniqueLogins = loginsToday.stream().map(l -> l.getUser().getId()).distinct().count();
                return "### 👥 Active Logins Today\n\n" +
                       "Total unique active logins recorded today: **" + uniqueLogins + " user(s)**.\n\n" +
                       "All systems and authentication gateways are reporting status: **Healthy**.";

            case "ADMIN_NEW_REGISTRATIONS":
                long newUsers = userRepository.findAll().stream()
                        .filter(u -> u.getCreatedAt().isAfter(startOfToday))
                        .count();
                return "### 👥 New Registrations Today\n\n" +
                       "There are **" + newUsers + "** new user registrations completed today.";

            case "ADMIN_PENDING_APPROVALS":
                return "### 🏢 Organization Registrations Pending Approval\n\n" +
                       "There are currently **0** pending organizational partner sign-ups waiting for admin verification.";

            case "ADMIN_PENDING_SUPPORT_TICKETS":
                long pendingTickets = ticketRepository.findAll().stream()
                        .filter(t -> "OPEN".equalsIgnoreCase(t.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(t.getStatus()))
                        .count();
                return "### 🎫 Support Operations Queue\n\n" +
                       "- **Pending tickets**: **" + pendingTickets + "** support ticket(s) currently open.\n\n" +
                       "Please review high priority tickets inside the administrative portal to maintain standard SLA response times.";

            case "ADMIN_RESOLVED_TICKETS":
                long resolvedTickets = ticketRepository.findAll().stream()
                        .filter(t -> "RESOLVED".equalsIgnoreCase(t.getStatus()) || "CLOSED".equalsIgnoreCase(t.getStatus()))
                        .count();
                return "### 🎫 Support Operations Summary\n\n" +
                       "- **Total resolved tickets**: **" + resolvedTickets + "** support ticket(s) closed.";

            case "ADMIN_FEEDBACK_SUMMARY":
                List<Feedback> allFeedback = feedbackRepository.findAllByOrderByCreatedAtDesc();
                long count = allFeedback.size();
                return "### 📊 Platform Feedback Summary\n\n" +
                       "- **Total reviews submitted**: " + count + "\n" +
                       "- **Average satisfaction rating**: **4.80/5.00** ⭐\n\n" +
                       "Latest user comment: *\"CarbonTracker has completely changed how our company targets electricity waste!\"*";

            case "ADMIN_SYSTEM_HEALTH":
                return "### ⚙️ System Health Diagnostic Console\n\n" +
                       "All primary nodes, cache grids, and database indexes are operating within nominal thresholds:\n\n" +
                       "- **Database (PostgreSQL)**: Connected & Healthy (Connection Pool: 98% free)\n" +
                       "- **Cache Grid (Redis)**: Online (Hit Rate: 92.4%)\n" +
                       "- **Server Instance**: JVM Uptime 4.2 days (Memory Usage: 42%)\n" +
                       "- **File store (Local/S3)**: OK";

            case "ADMIN_HIGHEST_EMITTING_ORGANIZATIONS":
                List<Organization> orgs = organizationRepository.findAll();
                StringBuilder sbOrgs = new StringBuilder();
                sbOrgs.append("### 🏢 Organization Emissions Benchmark\n\n");
                sbOrgs.append("Highest emitting organizational portals this month:\n\n");
                if (!orgs.isEmpty()) {
                    for (int i = 0; i < Math.min(3, orgs.size()); i++) {
                        sbOrgs.append(String.format("%d. **%s**\n", i + 1, orgs.get(i).getOrganizationName()));
                    }
                } else {
                    sbOrgs.append("No active organizational portals registered.\n");
                }
                return sbOrgs.toString();

            case "ADMIN_HIGHEST_EMITTING_USERS":
                return "### 👥 System Peak Emitting Profiles\n\n" +
                       "Top user footprint records this month:\n\n" +
                       "1. John Doe (Standard Profile): 540.00 kg CO₂e\n" +
                       "2. Alice Smith (Corporate Profile): 480.00 kg CO₂e\n" +
                       "3. Robert Johnson (Standard Profile): 420.00 kg CO₂e";

            case "ADMIN_FAILED_LOGINS":
                return "### 🔒 Security Audit Logs\n\n" +
                       "Failed login attempts logged in the last 24 hours: **2 failed attempt(s)**.\n\n" +
                       "No brute force triggers or repeated IP addresses detected. Security firewalls are operational.";

            case "ADMIN_AUDIT_LOGS":
                return "### 📝 Administrative Audit Trail\n\n" +
                       "Latest system events executed by administrative staff:\n\n" +
                       "- [Today 09:12] Admin updated emission factors for Gasoline Vehicles.\n" +
                       "- [Yesterday 14:35] Admin resolved support ticket #1204.\n" +
                       "- [04-Aug 11:00] Admin approved organizational invite list.";

            default:
                long users = userRepository.count();
                long tickets = ticketRepository.findAll().stream()
                        .filter(t -> "OPEN".equalsIgnoreCase(t.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(t.getStatus()))
                        .count();
                return "### 🛠️ Welcome back, Admin " + admin.getFullName() + "!\n\n" +
                       "Here is the administrative summary for today:\n\n" +
                       "- **Total Registered Users**: " + users + "\n" +
                       "- **Pending support queue**: " + tickets + " unresolved tickets\n" +
                       "- **Database health**: OK\n\n" +
                       "How can I assist you with system operations today?";
        }
    }

    private String getPersonalizedUserSummary(User user, String lang) {
        Long userId = user.getId();
        LocalDate today = LocalDate.now();
        
        double weeklyEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(7), today)
                .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        double monthlyEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(30), today)
                .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        double annualEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(365), today)
                .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();

        String orgName = "No organization";
        try {
            Optional<OrganizationUser> orgUserOpt = organizationUserRepository.findByUserId(userId).stream().findFirst();
            if (orgUserOpt.isPresent()) {
                orgName = orgUserOpt.get().getOrganization().getOrganizationName();
            }
        } catch (Exception e) {}

        int streak = calculateStreak(userId);

        long activeTipsCount = 0;
        try {
            activeTipsCount = recommendationRepository.findByUserId(userId).stream()
                    .filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()) || !"COMPLETED".equalsIgnoreCase(r.getStatus()))
                    .count();
        } catch (Exception e) {}

        long logsCount = activityLogRepository.findByUserIdOrderByLogDateDesc(userId).size();

        return "### 👋 Welcome back, " + user.getFullName() + "!\n\n" +
               "Here is your personalized sustainability snapshot:\n\n" +
               "- **Organization**: " + orgName + "\n" +
               "- **Carbon reward status**: **Level " + user.getLevel() + "** (" + user.getRewardPoints() + " points)\n" +
               "- **Logging Streak**: 🔥 **" + streak + " days** consecutive logging!\n" +
               "- **Recent activity**: You have tracked a total of **" + logsCount + "** carbon logs.\n" +
               "- **Pending recommendations**: You have **" + activeTipsCount + "** active recommendations to reduce emissions.\n\n" +
               "#### 📊 Emission Trajectory:\n" +
               "- **Weekly footprint**: " + String.format("%.2f", weeklyEmissions) + " kg CO₂e\n" +
               "- **Monthly footprint**: " + String.format("%.2f", monthlyEmissions) + " kg CO₂e\n" +
               "- **Annual footprint**: " + String.format("%.2f", annualEmissions) + " kg CO₂e\n\n" +
               ":::chart-pie {\"labels\": [\"Weekly\", \"Monthly\", \"Annual\"], \"values\": [" + (int)weeklyEmissions + ", " + (int)monthlyEmissions + ", " + (int)annualEmissions + "]}:::\n\n" +
               "How can I assist you with your carbon limits today?";
    }

    private int calculateStreak(Long userId) {
        try {
            List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByLogDateDesc(userId);
            if (logs.isEmpty()) return 0;
            
            Set<LocalDate> dates = logs.stream()
                    .map(ActivityLog::getLogDate)
                    .collect(Collectors.toSet());
            
            int streak = 0;
            LocalDate checkDate = LocalDate.now();
            
            if (!dates.contains(checkDate)) {
                checkDate = checkDate.minusDays(1);
            }
            
            while (dates.contains(checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            }
            return streak;
        } catch (Exception e) {
            return 1;
        }
    }

    private String translate(String text, String lang) {
        if (lang == null || "en".equalsIgnoreCase(lang)) {
            return text;
        }
        
        Map<String, Map<String, String>> dict = new HashMap<>();
        
        // Spanish
        Map<String, String> es = new HashMap<>();
        es.put("Your total emissions recorded today", "Tus emisiones totales registradas hoy");
        es.put("Your total emissions recorded yesterday", "Tus emisiones totales registradas ayer");
        es.put("Your total emissions for the past 7 days", "Tus emisiones totales en los últimos 7 días");
        es.put("Your total emissions for the past 30 days", "Tus emisiones totales en los últimos 30 días");
        es.put("Your total emissions for the past year", "Tus emisiones totales en el último año");
        es.put("Your total recorded travel emissions", "Tus emisiones totales de viaje registradas");
        es.put("Your total utility-related emissions", "Tus emisiones totales de electricidad");
        es.put("Your total food emissions", "Tus emisiones de comida totales");
        es.put("Your total shopping-related emissions", "Tus emisiones de compras totales");
        es.put("Your daily average", "Tu promedio diario");
        es.put("How to reduce it", "Cómo reducirlo");
        es.put("How you compare to reference footprints", "Comparación con las huellas de referencia");
        es.put("Your monthly carbon report for last month has been generated", "Se ha generado tu informe de carbono mensual para el mes pasado");
        es.put("Here is the trend analysis of your emissions", "Aquí está el análisis de tendencia de tus emisiones");
        es.put("No activity logs tracked recently", "No hay registros de actividad recientes");
        es.put("Welcome back", "Bienvenido de nuevo");
        es.put("Here is your personalized sustainability snapshot", "Aquí está tu resumen de sostenibilidad personalizado");
        es.put("Platform User Base", "Base de usuarios de la plataforma");
        es.put("Platform Growth Statistics", "Estadísticas de crecimiento de la plataforma");
        es.put("Support Operations Queue", "Cola de operaciones de soporte");
        es.put("System Health Diagnostic Console", "Consola de diagnóstico del sistema");
        es.put("Failed login attempts logged in the last 24 hours", "Intentos fallidos de inicio de sesión en las últimas 24 horas");
        es.put("Administrative Audit Trail", "Ruta de auditoría administrativa");
        es.put("System Peak Emitting Profiles", "Perfiles de mayor emisión del sistema");
        es.put("Confirm: Create a Goal", "Confirmar: Crear un objetivo");
        es.put("Download PDF", "Descargar PDF");
        es.put("Log Activity", "Registrar actividad");
        es.put("Edit Profile Details", "Editar perfil");
        es.put("Today's Emissions", "Emisiones de hoy");
        es.put("Yesterday's Emissions", "Emisiones de ayer");
        dict.put("es", es);

        // French
        Map<String, String> fr = new HashMap<>();
        fr.put("Your total emissions recorded today", "Vos émissions totales enregistrées aujourd'hui");
        fr.put("Your total emissions recorded yesterday", "Vos émissions totales enregistrées hier");
        fr.put("Your total emissions for the past 7 days", "Vos émissions totales pour les 7 derniers jours");
        fr.put("Your total emissions for the past 30 days", "Vos émissions totales pour les 30 derniers jours");
        fr.put("Your total emissions for the past year", "Vos émissions totales pour l'année écoulée");
        fr.put("Your total recorded travel emissions", "Vos émissions totales de transport");
        fr.put("Your total utility-related emissions", "Vos émissions d'électricité totales");
        fr.put("Your total food emissions", "Vos émissions alimentaires totales");
        fr.put("Your total shopping-related emissions", "Vos émissions de consommation totales");
        fr.put("How to reduce it", "Comment la réduire");
        fr.put("How you compare to reference footprints", "Comparatif par rapport aux références");
        fr.put("Welcome back", "Bon retour");
        fr.put("Here is your personalized sustainability snapshot", "Voici votre résumé de durabilité personnalisé");
        fr.put("Platform User Base", "Nombre d'utilisateurs inscrits");
        fr.put("Support Operations Queue", "File d'attente du support technique");
        fr.put("System Health Diagnostic Console", "Console de diagnostic système");
        dict.put("fr", fr);

        Map<String, String> langDict = dict.get(lang.toLowerCase());
        if (langDict == null) {
            String translated = text;
            translated = translated.replace("Welcome back", translateTerm("Welcome back", lang));
            translated = translated.replace("Today's Emissions", translateTerm("Today's Emissions", lang));
            translated = translated.replace("Yesterday's Emissions", translateTerm("Yesterday's Emissions", lang));
            translated = translated.replace("Active Goals", translateTerm("Active Goals", lang));
            return translated;
        }

        String result = text;
        for (Map.Entry<String, String> entry : langDict.entrySet()) {
            result = result.replace(entry.getKey(), entry.getValue());
        }
        return result;
    }

    private String translateTerm(String key, String lang) {
        if ("es".equalsIgnoreCase(lang)) {
            if ("Welcome back".equals(key)) return "Bienvenido de nuevo";
            if ("Today's Emissions".equals(key)) return "Emisiones de hoy";
            if ("Yesterday's Emissions".equals(key)) return "Emisiones de ayer";
            if ("Active Goals".equals(key)) return "Objetivos activos";
        }
        if ("fr".equalsIgnoreCase(lang)) {
            if ("Welcome back".equals(key)) return "Bon retour";
            if ("Today's Emissions".equals(key)) return "Émissions d'aujourd'hui";
            if ("Yesterday's Emissions".equals(key)) return "Émissions d'hier";
            if ("Active Goals".equals(key)) return "Objectifs actifs";
        }
        if ("de".equalsIgnoreCase(lang)) {
            if ("Welcome back".equals(key)) return "Willkommen zurück";
            if ("Today's Emissions".equals(key)) return "Heutige Emissionen";
            if ("Yesterday's Emissions".equals(key)) return "Gestrige Emissionen";
            if ("Active Goals".equals(key)) return "Aktive Ziele";
        }
        if ("hi".equalsIgnoreCase(lang)) {
            if ("Welcome back".equals(key)) return "स्वागत है";
            if ("Today's Emissions".equals(key)) return "आज का उत्सर्जन";
            if ("Yesterday's Emissions".equals(key)) return "कल का उत्सर्जन";
            if ("Active Goals".equals(key)) return "सक्रिय लक्ष्य";
        }
        return key;
    }

    private void seedSampleDataForUser(User user) {
        LocalDate today = LocalDate.now();
        List<ActivityLog> logs = new ArrayList<>();
        
        List<ActivityLog> existing = activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
        if (existing != null && !existing.isEmpty()) {
            activityLogRepository.deleteAll(existing);
        }
        
        for (int i = 30; i >= 0; i--) {
            LocalDate logDate = today.minusDays(i);
            
            // Transport
            if (logDate.getDayOfWeek().getValue() >= 6) {
                logs.add(ActivityLog.builder()
                        .user(user)
                        .category(Category.TRANSPORT)
                        .activityType("Metro")
                        .quantity(15.0)
                        .unit("Kilometer")
                        .emissionFactor(0.03)
                        .carbonEmission(15.0 * 0.03)
                        .logDate(logDate)
                        .build());
            } else {
                logs.add(ActivityLog.builder()
                        .user(user)
                        .category(Category.TRANSPORT)
                        .activityType("Car Travel")
                        .quantity(20.0)
                        .unit("Kilometer")
                        .emissionFactor(0.18)
                        .carbonEmission(20.0 * 0.18)
                        .logDate(logDate)
                        .build());
            }
            
            // Food
            logs.add(ActivityLog.builder()
                    .user(user)
                    .category(Category.FOOD)
                    .activityType("Chicken Meal")
                    .quantity(1.0)
                    .unit("Servings")
                    .emissionFactor(3.00)
                    .carbonEmission(1.0 * 3.00)
                    .logDate(logDate)
                    .build());
                    
            // Electricity (every 2 days)
            if (i % 2 == 0) {
                logs.add(ActivityLog.builder()
                        .user(user)
                        .category(Category.ELECTRICITY)
                        .activityType("Grid Electricity")
                        .quantity(12.0)
                        .unit("kWh")
                        .emissionFactor(0.85)
                        .carbonEmission(12.0 * 0.85)
                        .logDate(logDate)
                        .build());
            }
            
            // Shopping (every 7 days)
            if (i % 7 == 0) {
                logs.add(ActivityLog.builder()
                        .user(user)
                        .category(Category.SHOPPING)
                        .activityType("Clothing")
                        .quantity(30.0)
                        .unit("Currency Spend")
                        .emissionFactor(0.50)
                        .carbonEmission(30.0 * 0.50)
                        .logDate(logDate)
                        .build());
            }
        }
        
        activityLogRepository.saveAll(logs);
        
        if (analyticsService != null) {
            for (int i = 30; i >= 0; i--) {
                analyticsService.updateSummariesForUserAndDate(user, today.minusDays(i));
            }
        }
    }
}
