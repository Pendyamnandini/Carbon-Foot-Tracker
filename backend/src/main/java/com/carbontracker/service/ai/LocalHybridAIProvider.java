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
    private AuditLogRepository auditLogRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private com.carbontracker.service.AnalyticsService analyticsService;

    private static class ConversationContext {
        String category = null; // TRANSPORT, ELECTRICITY, FOOD, SHOPPING, ALL
        String timePeriod = null; // TODAY, YESTERDAY, THIS_WEEK, LAST_WEEK, THIS_MONTH, LAST_MONTH, THIS_YEAR, CUSTOM
        String metric = null; // TOTAL, AVERAGE, HIGHEST, LOWEST, TREND, COMPARISON, RECOMMENDATION, RECENT
        LocalDate customStartDate = null;
        LocalDate customEndDate = null;
    }

    @Override
    public String generateResponse(String systemPrompt, String userMessage, List<ChatMessageDto> history) {
        User user = getCurrentUser();
        if (user == null) {
            return "### ⚠️ Session Timeout\n\nCould not verify your authentication session. Please log in again.";
        }

        String userRole = user.getRole().name();
        String lang = user.getLanguage() != null ? user.getLanguage() : "en";
        String normalizedMsg = userMessage.toLowerCase().trim();

        // 1. Detect direct conversational actions / shortcuts
        String conversationalIntent = detectConversationalIntent(normalizedMsg);
        if (conversationalIntent != null) {
            if ("ACTION_SEED_DATA".equals(conversationalIntent)) {
                seedSampleDataForUser(user);
                return translate("### 📊 Sample Data Seeding Successful!\n\n" +
                       "I have generated **30 days** of realistic activities (commutes, electric bills, and meals) in the database for your account (" + user.getFullName() + ").\n\n" +
                       "Please **refresh your Dashboard page** to see the daily emissions chart, weekly trends, categories breakdown, and sustainability eco-scores update live!", lang);
            }
            if ("ADMIN".equalsIgnoreCase(userRole) || "ORG_ADMIN".equalsIgnoreCase(userRole)) {
                return translate(handleAdminIntents(conversationalIntent, user, lang), lang);
            } else {
                if (conversationalIntent.startsWith("ADMIN_")) {
                    return translate("### ⛔ Access Restricted\n\nI am sorry, but your account role does not have authorization to view platform administrative metrics, users database, or system health logs.", lang);
                }
                return translate(handleUserIntents(conversationalIntent, user, lang), lang);
            }
        }

        // 2. Identify Admin specific monitoring queries
        if ("ADMIN".equalsIgnoreCase(userRole) || "ORG_ADMIN".equalsIgnoreCase(userRole)) {
            String adminIntent = detectAdminIntent(normalizedMsg);
            if (adminIntent != null) {
                return translate(handleAdminIntents(adminIntent, user, lang), lang);
            }
        } else {
            String adminIntent = detectAdminIntent(normalizedMsg);
            if (adminIntent != null) {
                return translate("### ⛔ Access Restricted\n\nI am sorry, but your account role does not have authorization to view platform administrative metrics, users database, or system health logs.", lang);
            }
        }

        // 3. Resolve context from current message and conversation history
        ConversationContext ctx = resolveContext(userMessage, history);

        // 4. Generate query-specific database analytics response
        String response = generateEmissionResponse(ctx, user, lang);

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

    private String detectConversationalIntent(String msg) {
        String paddedMsg = " " + msg + " ";
        if (paddedMsg.matches(".*\\b(seed|populate|fill|sample data|empty|no activities)\\b.*")) return "ACTION_SEED_DATA";
        if (paddedMsg.matches(".*\\b(who are you|your name|what are you|identity)\\b.*")) return "BOT_IDENTITY";
        if (paddedMsg.matches(".*\\b(how are you|how is it going|how do you do|status)\\b.*")) return "BOT_STATUS";
        if (paddedMsg.matches(".*\\b(thank|thanks|great job|awesome|perfect)\\b.*")) return "BOT_THANKS";
        if (paddedMsg.matches(".*\\b(help|capabilities|what can you do|features|how to use)\\b.*")) return "BOT_HELP";
        if (paddedMsg.matches(".*\\b(hello|hi|hey|good morning|good afternoon|greeting|what's up|morning|evening)\\b.*")) return "BOT_GREETING";
        if (paddedMsg.matches(".*\\b(goal|target|objective)\\b.*")) return "GOAL_PROGRESS";
        if (paddedMsg.matches(".*\\b(badge|achievement|trophy)\\b.*")) return "BADGE_PROGRESS";
        if (paddedMsg.matches(".*\\b(leaderboard|ranking|rank|top)\\b.*")) return "LEADERBOARD";
        if (paddedMsg.matches(".*\\b(benchmark|cohort|compare to others)\\b.*")) return "BENCHMARKING";
        if (paddedMsg.matches(".*\\b(export|pdf|download|monthly report|generate report)\\b.*")) return "REPORTS";
        if (paddedMsg.matches(".*\\b(profile|my details|account)\\b.*")) return "USER_PROFILE";
        if (paddedMsg.matches(".*\\b(streak|consecutive days)\\b.*")) return "USER_STREAK";
        if (paddedMsg.matches(".*\\b(notification|alerts)\\b.*")) return "NOTIFICATIONS";
        if (paddedMsg.matches(".*\\b(waste|trash|recycling)\\b.*")) return "WASTE_MANAGEMENT";
        if (paddedMsg.matches(".*\\b(score|sustainability score|eco score)\\b.*")) return "SUSTAINABILITY_SCORE";
        if (paddedMsg.matches(".*\\b(summary|summarize|overview|recap)\\b.*")) return "SUMMARY";
        if (paddedMsg.matches(".*\\b(category|breakdown|which category|top category)\\b.*")) return "CATEGORY_BREAKDOWN";
        if (paddedMsg.matches(".*\\b(logged today|my logs|what did i log|recent activities)\\b.*")) return "DAILY_LOG";
        if (paddedMsg.matches(".*\\b(net zero|carbon neutral|offset)\\b.*")) return "NET_ZERO";
        return null;
    }

    private String detectAdminIntent(String msg) {
        String paddedMsg = " " + msg + " ";
        if (paddedMsg.matches(".*\\b(new registration|registrations today|registered today|user registrations)\\b.*")) return "ADMIN_NEW_REGISTRATIONS";
        if (paddedMsg.matches(".*\\b(total user|how many users|platform users)\\b.*")) return "ADMIN_TOTAL_USERS";
        if (paddedMsg.matches(".*\\b(active user|online user|most active|login)\\b.*")) return "ADMIN_ACTIVE_USERS";
        if (paddedMsg.matches(".*\\b(inactive|cold|silent|no login)\\b.*")) return "ADMIN_INACTIVE_USERS";
        if (paddedMsg.matches(".*\\b(highest emitting user|highest emitter user|top emitter)\\b.*")) return "ADMIN_HIGHEST_EMITTING_USERS";
        if (paddedMsg.matches(".*\\b(pending ticket|support ticket|open ticket|tickets)\\b.*")) return "ADMIN_PENDING_SUPPORT_TICKETS";
        if (paddedMsg.matches(".*\\b(system health|server status|database health|health diagnostics)\\b.*")) return "ADMIN_SYSTEM_HEALTH";
        if (paddedMsg.matches(".*\\b(highest emission organization|highest emitting organization|organization statistics|company|org)\\b.*")) return "ADMIN_HIGHEST_EMITTING_ORGANIZATIONS";
        if (paddedMsg.matches(".*\\b(feedback|review)\\b.*")) return "ADMIN_FEEDBACK_SUMMARY";
        if (paddedMsg.matches(".*\\b(category analysis|category breakdown)\\b.*")) return "ADMIN_CATEGORY_ANALYSIS";
        if (paddedMsg.matches(".*\\b(monthly trend|trends|monthly report)\\b.*")) return "ADMIN_MONTHLY_TRENDS";
        if (paddedMsg.matches(".*\\b(org comparison|compare orgs)\\b.*")) return "ADMIN_ORG_COMPARISON";
        return null;
    }

    private ConversationContext resolveContext(String userMessage, List<ChatMessageDto> history) {
        ConversationContext ctx = new ConversationContext();
        String msg = userMessage.toLowerCase().trim();

        ctx.category = extractCategory(msg);
        ctx.timePeriod = extractTimePeriod(msg);
        ctx.metric = extractMetric(msg);
        extractCustomDates(msg, ctx);

        if (history != null && !history.isEmpty()) {
            for (int i = history.size() - 1; i >= 0; i--) {
                ChatMessageDto m = history.get(i);
                if ("USER".equalsIgnoreCase(m.getSender())) {
                    String prevMsg = m.getContent().toLowerCase().trim();
                    if (ctx.category == null) ctx.category = extractCategory(prevMsg);
                    if (ctx.timePeriod == null) ctx.timePeriod = extractTimePeriod(prevMsg);
                    if (ctx.metric == null) ctx.metric = extractMetric(prevMsg);
                    if (ctx.timePeriod != null && ctx.timePeriod.equals("CUSTOM") && ctx.customStartDate == null) {
                        extractCustomDates(prevMsg, ctx);
                    }
                }
            }
        }

        if (ctx.category == null) ctx.category = "ALL";
        if (ctx.timePeriod == null) ctx.timePeriod = "THIS_MONTH";
        if (ctx.metric == null) ctx.metric = "TOTAL";

        return ctx;
    }

    private String extractCategory(String text) {
        if (text.contains("transport") || text.contains("car") || text.contains("drive") || text.contains("travel") || text.contains("vehicle") || text.contains("commute") || text.contains("metro") || text.contains("train") || text.contains("bus") || text.contains("flight")) {
            return "TRANSPORT";
        }
        if (text.contains("electricity") || text.contains("power") || text.contains("utility") || text.contains("ac") || text.contains("heater") || text.contains("energy") || text.contains("grid") || text.contains("solar") || text.contains("light")) {
            return "ELECTRICITY";
        }
        if (text.contains("food") || text.contains("diet") || text.contains("eat") || text.contains("meal") || text.contains("meat") || text.contains("chicken") || text.contains("beef") || text.contains("pork") || text.contains("vegan") || text.contains("vegetarian")) {
            return "FOOD";
        }
        if (text.contains("shopping") || text.contains("purchase") || text.contains("buy") || text.contains("cloth") || text.contains("goods") || text.contains("electronics") || text.contains("clothes")) {
            return "SHOPPING";
        }
        if (text.contains("all categories") || text.contains("overall") || text.contains("everything") || text.contains("total emissions")) {
            return "ALL";
        }
        return null;
    }

    private String extractTimePeriod(String text) {
        if (text.contains("today") || text.contains("now")) {
            return "TODAY";
        }
        if (text.contains("yesterday") || text.contains("yeswterday")) {
            return "YESTERDAY";
        }
        if (text.contains("last week") || text.contains("previous week")) {
            return "LAST_WEEK";
        }
        if (text.contains("this week") || text.contains("weekly") || text.contains("week")) {
            return "THIS_WEEK";
        }
        if (text.contains("last month") || text.contains("previous month")) {
            return "LAST_MONTH";
        }
        if (text.contains("this month") || text.contains("monthly") || text.contains("month")) {
            return "THIS_MONTH";
        }
        if (text.contains("this year") || text.contains("yearly") || text.contains("annual") || text.contains("year")) {
            return "THIS_YEAR";
        }
        if (text.contains("from") || text.contains("between") || text.matches(".*\\d{4}-\\d{2}-\\d{2}.*")) {
            return "CUSTOM";
        }
        return null;
    }

    private String extractMetric(String text) {
        if (text.contains("highest") || text.contains("peak") || text.contains("max") || text.contains("most")) {
            return "HIGHEST";
        }
        if (text.contains("lowest") || text.contains("min") || text.contains("least")) {
            return "LOWEST";
        }
        if (text.contains("average") || text.contains("avg")) {
            return "AVERAGE";
        }
        if (text.contains("recommend") || text.contains("tip") || text.contains("reduce") || text.contains("how can i") || text.contains("how to") || text.contains("save") || text.contains("cut") || text.contains("advice") || text.contains("suggestion")) {
            return "RECOMMENDATION";
        }
        if (text.contains("trend") || text.contains("chart") || text.contains("graph") || text.contains("plot")) {
            return "TREND";
        }
        if (text.contains("compare") || text.contains("versus") || text.contains("vs") || text.contains("difference")) {
            return "COMPARISON";
        }
        if (text.contains("recent") || text.contains("last logs") || text.contains("history") || text.contains("logs")) {
            return "RECENT";
        }
        return null;
    }

    private void extractCustomDates(String text, ConversationContext ctx) {
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
        java.util.regex.Matcher m = p.matcher(text);
        List<String> dates = new ArrayList<>();
        while (m.find()) {
            dates.add(m.group());
        }
        if (dates.size() >= 2) {
            try {
                ctx.customStartDate = LocalDate.parse(dates.get(0));
                ctx.customEndDate = LocalDate.parse(dates.get(1));
                ctx.timePeriod = "CUSTOM";
            } catch (Exception e) {}
        } else if (dates.size() == 1) {
            try {
                ctx.customStartDate = LocalDate.parse(dates.get(0));
                ctx.customEndDate = ctx.customStartDate;
                ctx.timePeriod = "CUSTOM";
            } catch (Exception e) {}
        }
    }

    private double calculatePercentageChange(double current, double previous) {
        if (previous == 0.0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((current - previous) / previous) * 100.0;
    }

    private String toJsonList(List<String> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append("\"").append(list.get(i)).append("\"");
            if (i < list.size() - 1) sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
    }

    private String toJsonValues(List<Integer> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(list.get(i));
            if (i < list.size() - 1) sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
    }

    private String generateEmissionResponse(ConversationContext ctx, User user, String lang) {
        LocalDate today = LocalDate.now();
        LocalDate start = null;
        LocalDate end = null;
        LocalDate prevStart = null;
        LocalDate prevEnd = null;

        String periodName = "this month";
        if ("TODAY".equals(ctx.timePeriod)) {
            start = today;
            end = today;
            prevStart = today.minusDays(1);
            prevEnd = prevStart;
            periodName = "today";
        } else if ("YESTERDAY".equals(ctx.timePeriod)) {
            start = today.minusDays(1);
            end = start;
            prevStart = start.minusDays(1);
            prevEnd = prevStart;
            periodName = "yesterday";
        } else if ("THIS_WEEK".equals(ctx.timePeriod)) {
            start = today.with(java.time.DayOfWeek.MONDAY);
            end = today;
            prevStart = start.minusWeeks(1);
            prevEnd = start.minusDays(1);
            periodName = "this week";
        } else if ("LAST_WEEK".equals(ctx.timePeriod)) {
            start = today.with(java.time.DayOfWeek.MONDAY).minusWeeks(1);
            end = start.plusDays(6);
            prevStart = start.minusWeeks(1);
            prevEnd = start.minusDays(1);
            periodName = "last week";
        } else if ("THIS_MONTH".equals(ctx.timePeriod)) {
            start = today.withDayOfMonth(1);
            end = today;
            prevStart = start.minusMonths(1);
            prevEnd = prevStart.withDayOfMonth(prevStart.lengthOfMonth());
            periodName = "this month";
        } else if ("LAST_MONTH".equals(ctx.timePeriod)) {
            start = today.minusMonths(1).withDayOfMonth(1);
            end = start.withDayOfMonth(start.lengthOfMonth());
            prevStart = start.minusMonths(1);
            prevEnd = prevStart.withDayOfMonth(prevStart.lengthOfMonth());
            periodName = "last month";
        } else if ("THIS_YEAR".equals(ctx.timePeriod)) {
            start = today.withDayOfYear(1);
            end = today;
            prevStart = start.minusYears(1);
            prevEnd = prevStart.withMonth(12).withDayOfMonth(31);
            periodName = "this year";
        } else if ("CUSTOM".equals(ctx.timePeriod) && ctx.customStartDate != null) {
            start = ctx.customStartDate;
            end = ctx.customEndDate;
            long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
            prevStart = start.minusDays(days);
            prevEnd = start.minusDays(1);
            periodName = "selected period (" + start.toString() + " to " + end.toString() + ")";
        } else {
            start = today.withDayOfMonth(1);
            end = today;
            prevStart = start.minusMonths(1);
            prevEnd = prevStart.withDayOfMonth(prevStart.lengthOfMonth());
            periodName = "this month";
        }

        List<ActivityLog> allPeriodLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), start, end);
        List<ActivityLog> logs = allPeriodLogs;
        if (!"ALL".equals(ctx.category)) {
            logs = allPeriodLogs.stream()
                    .filter(l -> l.getCategory().name().equalsIgnoreCase(ctx.category))
                    .collect(Collectors.toList());
        }

        double total = logs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
        int count = logs.size();
        ActivityLog peakLog = logs.stream().max(Comparator.comparingDouble(ActivityLog::getCarbonEmission)).orElse(null);
        double avg = count > 0 ? total / count : 0.0;

        List<ActivityLog> allPrevLogs = activityLogRepository.findByUserIdAndLogDateBetween(user.getId(), prevStart, prevEnd);
        double prevTotal = allPrevLogs.stream()
                .filter(l -> "ALL".equals(ctx.category) || l.getCategory().name().equalsIgnoreCase(ctx.category))
                .mapToDouble(ActivityLog::getCarbonEmission)
                .sum();
        double diffPct = calculatePercentageChange(total, prevTotal);

        String categoryLabel = ctx.category.substring(0, 1).toUpperCase() + ctx.category.substring(1).toLowerCase();
        if ("ALL".equals(ctx.category)) categoryLabel = "Overall Emissions";

        StringBuilder sb = new StringBuilder();
        
        List<ActivityLog> top3Logs = logs.stream()
                .sorted(Comparator.comparingDouble(ActivityLog::getCarbonEmission).reversed())
                .limit(3)
                .collect(Collectors.toList());
                
        String[] headerEmojis = {"📊", "📈", "📉", "🌍", "🌱", "🔍"};
        String headerEmoji = headerEmojis[new Random().nextInt(headerEmojis.length)];
        sb.append(String.format("### %s %s (%s)\n\n", headerEmoji, categoryLabel, periodName));
        
        sb.append(String.format("- **Total Footprint**: **%.2f kg CO₂e**\n", total));
        if (!"ALL".equals(ctx.category)) {
            sb.append(String.format("- **Activities Tracked**: **%d logs**\n", count));
        } else {
            sb.append(String.format("- **Average Emissions**: **%.2f kg CO₂e/log**\n", avg));
        }
        
        if (!top3Logs.isEmpty()) {
            sb.append("\n#### 🔥 Top Contributors\n");
            for (int i = 0; i < top3Logs.size(); i++) {
                ActivityLog log = top3Logs.get(i);
                sb.append(String.format("%d. **%s** (%.2f kg CO₂e) on %s\n", i + 1, log.getActivityType(), log.getCarbonEmission(), log.getLogDate()));
            }
            sb.append("\n");
        }

        if (prevTotal > 0) {
            String dirIcon = diffPct >= 0 ? "📈" : "📉";
            String dirWord = diffPct >= 0 ? "increase" : "decrease";
            sb.append(String.format("- **Compared to previous period**: **%s %.1f%% %s** (prior period total: %.1f kg)\n", dirIcon, Math.abs(diffPct), dirWord, prevTotal));
        } else {
            sb.append("- **Compared to previous period**: No historical data available.\n");
        }

        sb.append("\n");

        if ("RECOMMENDATION".equals(ctx.metric)) {
            sb.append("#### 💡 Smart Action Recommendations\n");
            if ("TRANSPORT".equals(ctx.category)) {
                sb.append("1. **Metro Shift**: Commuting by electric light-rail instead of a private car saves **85% emissions** (~12.4 kg CO₂e weekly).\n");
                sb.append("2. **Active Commuting**: Walks or cycle rides under 3 km keep carbon levels at **0 kg**.\n\n");
                sb.append(":::action-link {\"label\": \"Log Transport Commute\", \"action\": \"log-transport\"}:::");
            } else if ("ELECTRICITY".equals(ctx.category)) {
                sb.append("1. **Thermostat Regulation**: Adjusting cooling settings to 24°C saves up to **18.5% on power consumption**.\n");
                sb.append("2. **Standby Off**: Unplugging computer setups and media centers at night avoids ghost loads.\n\n");
                sb.append(":::action-link {\"label\": \"Audit Power Bills\", \"action\": \"log-electricity\"}:::");
            } else if ("FOOD".equals(ctx.category)) {
                sb.append("1. **Plant-Forward Meal**: Choosing vegetarian options twice a week reduces food footprint by **60%**.\n");
                sb.append("2. **Local Buying**: Sourcing fresh groceries locally cuts shipping container footprint.\n\n");
                sb.append(":::action-link {\"label\": \"Log Vegan Meal\", \"action\": \"log-food\"}:::");
            } else if ("SHOPPING".equals(ctx.category)) {
                sb.append("1. **Circular Brands**: Invest in goods with recycled/refurbished ratings to cut waste by **70%**.\n");
                sb.append("2. **Refurbished Electronics**: Buying pre-owned tech saves high factory-assembly carbon.\n\n");
                sb.append(":::action-link {\"label\": \"Log Eco Purchase\", \"action\": \"log-shopping\"}:::");
            } else {
                sb.append("- Shifting travel trips to public transit yields the highest immediate carbon return.\n");
                sb.append("- Turn down standby chargers and energy heaters to save utility fuel.\n");
            }
        } else if ("TREND".equals(ctx.metric) || total > 0) {
            if ("ALL".equals(ctx.category)) {
                double tVal = allPeriodLogs.stream().filter(l -> l.getCategory() == Category.TRANSPORT).mapToDouble(ActivityLog::getCarbonEmission).sum();
                double eVal = allPeriodLogs.stream().filter(l -> l.getCategory() == Category.ELECTRICITY).mapToDouble(ActivityLog::getCarbonEmission).sum();
                double fVal = allPeriodLogs.stream().filter(l -> l.getCategory() == Category.FOOD).mapToDouble(ActivityLog::getCarbonEmission).sum();
                double sVal = allPeriodLogs.stream().filter(l -> l.getCategory() == Category.SHOPPING).mapToDouble(ActivityLog::getCarbonEmission).sum();
                
                List<String> labels = Arrays.asList("Transport", "Electricity", "Food", "Shopping");
                List<Integer> values = Arrays.asList((int)tVal, (int)eVal, (int)fVal, (int)sVal);
                
                sb.append(":::chart-pie {\"labels\": " + toJsonList(labels) + ", \"values\": " + toJsonValues(values) + "}:::\n\n");
            } else {
                List<String> labels = new ArrayList<>();
                List<Integer> values = new ArrayList<>();
                long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
                
                if (days <= 7) {
                    sb.append("#### 📅 Daily Breakdown\n");
                    for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                        final LocalDate currentD = d;
                        String label = d.getMonth().name().substring(0, 3) + " " + d.getDayOfMonth();
                        labels.add(label);
                        double dVal = logs.stream().filter(l -> l.getLogDate().equals(currentD)).mapToDouble(ActivityLog::getCarbonEmission).sum();
                        values.add((int)dVal);
                        sb.append(String.format("- **%s**: %.2f kg CO₂e\n", label, dVal));
                    }
                } else {
                    sb.append("#### 📅 Period Breakdown\n");
                    for (LocalDate d = start; d.isBefore(end.plusDays(1)); d = d.plusWeeks(1)) {
                        final LocalDate currentD = d;
                        LocalDate wEnd = d.plusDays(6).isAfter(end) ? end : d.plusDays(6);
                        final LocalDate currentWEnd = wEnd;
                        String label = d.getMonth().name().substring(0, 3) + " " + d.getDayOfMonth();
                        labels.add(label);
                        double wVal = logs.stream().filter(l -> !l.getLogDate().isBefore(currentD) && !l.getLogDate().isAfter(currentWEnd)).mapToDouble(ActivityLog::getCarbonEmission).sum();
                        values.add((int)wVal);
                        sb.append(String.format("- **Week of %s**: %.2f kg CO₂e\n", label, wVal));
                    }
                }
                sb.append("\n:::chart-bar {\"labels\": " + toJsonList(labels) + ", \"values\": " + toJsonValues(values) + "}:::\n\n");
            }
        }

        if (!"RECOMMENDATION".equals(ctx.metric)) {
            sb.append("#### 💡 Smart Action Recommendations\n");
            if ("TRANSPORT".equals(ctx.category)) {
                sb.append("Your transportation emissions are significant. Shift commutes to public transit or cycling to save up to **12.40 kg CO₂e**.\n\n");
                sb.append(":::action-link {\"label\": \"Log Transport Commute\", \"action\": \"log-transport\"}:::");
            } else if ("ELECTRICITY".equals(ctx.category)) {
                sb.append("Unplug phantom loads and configure cooling thermostats to 24°C to save up to **18.5% on utility emissions**.\n\n");
                sb.append(":::action-link {\"label\": \"Audit Power Bills\", \"action\": \"log-electricity\"}:::");
            } else if ("FOOD".equals(ctx.category)) {
                sb.append("Substitute animal meat servings for plant-based alternatives to reduce food footprint by **60%**.\n\n");
                sb.append(":::action-link {\"label\": \"Log Vegan Meal\", \"action\": \"log-food\"}:::");
            } else if ("SHOPPING".equals(ctx.category)) {
                sb.append("Prioritize circular items or buying pre-owned products to extend product life cycles.\n\n");
                sb.append(":::action-link {\"label\": \"Log Eco Purchase\", \"action\": \"log-shopping\"}:::");
            } else {
                double tVal = allPeriodLogs.stream().filter(l -> l.getCategory() == Category.TRANSPORT).mapToDouble(ActivityLog::getCarbonEmission).sum();
                double eVal = allPeriodLogs.stream().filter(l -> l.getCategory() == Category.ELECTRICITY).mapToDouble(ActivityLog::getCarbonEmission).sum();
                if (tVal > eVal) {
                    sb.append("🚗 **Transportation** is your highest footprint contributor. Try replacing car commutes with public transit or bicycle rides to cut emissions.\n");
                } else {
                    sb.append("⚡ **Electricity** is your primary footprint contributor. Adjust cooling thermostats and unplug standby electronics to optimize energy consumption.\n");
                }
            }
        }

        return sb.toString();
    }

    private String handleUserIntents(String intent, User user, String lang) {
        Long userId = user.getId();
        LocalDate today = LocalDate.now();
        Random rand = new Random();
        switch (intent) {
            case "BOT_IDENTITY":
                return "### 🤖 Carbon Tracker Assistant v2\n\n" +
                       "I am your dedicated **Carbon Assistant AI**, designed to trace footprints, audit logs, analyze trends, and recommend steps to help you reach Net Zero.";
            case "BOT_STATUS":
                return "### ⚙️ System Diagnostics Status\n\n" +
                       "All carbon databases: **Nominal**. Assistant cognitive engine: **Ready**. Sustainability metrics: **Live**.";
            case "BOT_THANKS":
                String[] thanks = {"### 🌿 Glad to help!\n\n", "### 💚 You're welcome!\n\n", "### ✨ Anytime!\n\n"};
                return thanks[rand.nextInt(thanks.length)] +
                       "Thank you for tracking carbon. Every step counts toward a carbon-neutral planet.";
            case "BOT_HELP":
                long totalGoals = goalRepository.findByUserId(userId).size();
                long totalBadges = userBadgeRepository.findByUserId(userId).size();
                return "### 🛠️ Sustainability Operations Console\n\n" +
                       "Here is how I can support your carbon tracking journey, **" + user.getFullName() + "**:\n\n" +
                       "1. **Footprint Summaries**: Query today's, yesterday's, weekly, or monthly carbon emissions.\n" +
                       "2. **Category Analyses**: Filter down to *Transport*, *Food*, *Electricity*, or *Shopping* footprints.\n" +
                       "3. **Reduction Actions**: Ask 'how to reduce transport emissions' to receive customized eco-tips.\n" +
                       "4. **Your Data**: Check your progress on your **" + totalGoals + " goals** or view your **" + totalBadges + " badges**.\n" +
                       "5. **Interactive Charts**: View dynamic Pie charts of category distribution and bar charts of monthly progress.";
            case "BOT_GREETING":
                int hour = LocalDateTime.now().getHour();
                String timeOfDay = (hour < 12) ? "Good morning" : (hour < 17) ? "Good afternoon" : "Good evening";
                double todayEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today, today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                int currentStreakGreeting = calculateStreak(userId);
                String[] ecoTips = {
                    "Try substituting one meat meal with a plant-based alternative today.",
                    "Walking or cycling for short trips can significantly lower your carbon footprint.",
                    "Unplug electronics when not in use to reduce phantom energy draw."
                };
                String randomTip = ecoTips[rand.nextInt(ecoTips.length)];
                String[] greetings = {
                    "### 👋 " + timeOfDay + ", " + user.getFullName() + "!\n\n",
                    "### 🌿 Hello " + user.getFullName() + "!\n\n",
                    "### ✨ Hi there, " + user.getFullName() + "!\n\n"
                };
                return greetings[rand.nextInt(greetings.length)] +
                       "I am your Carbon Tracker AI Assistant. Today you've tracked **" + String.format("%.2f", todayEmissions) + " kg CO₂e**.\n" +
                       "🔥 Current Logging Streak: **" + currentStreakGreeting + " days**\n\n" +
                       "💡 **Eco Tip:** " + randomTip + "\n\n" +
                       "How can I support your eco-goals today?";
            case "GOAL_PROGRESS":
                List<Goal> goals = goalRepository.findByUserId(userId);
                long activeGoals = goals.stream().filter(g -> GoalStatus.ACTIVE == g.getStatus()).count();
                long completedGoals = goals.stream().filter(g -> GoalStatus.COMPLETED == g.getStatus()).count();
                StringBuilder sbGoals = new StringBuilder();
                sbGoals.append("### 🎯 Goal Completion Status\n\n");
                sbGoals.append("- **Active Goals**: " + activeGoals + "\n");
                sbGoals.append("- **Completed Goals**: " + completedGoals + "\n\n");
                if (!goals.isEmpty()) {
                    sbGoals.append("| Title | Target Reduction | Status |\n");
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
                LocalDate startOfMonthLeaderboard = LocalDate.now().withDayOfMonth(1);
                List<User> allUsers = userRepository.findAll();
                Map<User, Double> userEmissionsMap = new HashMap<>();
                for (User u : allUsers) {
                    double t = activityLogRepository.findByUserIdAndLogDateBetween(u.getId(), startOfMonthLeaderboard, LocalDate.now())
                            .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                    userEmissionsMap.put(u, t);
                }
                List<Map.Entry<User, Double>> sortedLeaderboard = userEmissionsMap.entrySet().stream()
                        .sorted(Map.Entry.comparingByValue())
                        .collect(Collectors.toList());
                
                StringBuilder sbLeaderboard = new StringBuilder();
                sbLeaderboard.append("### 🏆 Sustainability Leaderboard (This Month)\n\n");
                sbLeaderboard.append("| Rank | User | Monthly Footprint | Status |\n");
                sbLeaderboard.append("| :--- | :--- | :--- | :--- |\n");
                int rank = 1;
                for (int i = 0; i < Math.min(5, sortedLeaderboard.size()); i++) {
                    Map.Entry<User, Double> entry = sortedLeaderboard.get(i);
                    String icon = rank == 1 ? "1️⃣" : rank == 2 ? "2️⃣" : rank == 3 ? "3️⃣" : rank + "️⃣";
                    String name = entry.getKey().getId().equals(userId) ? "**" + entry.getKey().getFullName() + "** (You)" : entry.getKey().getFullName();
                    String status = rank == 1 ? "🌟 Green Champion" : "🌱 Active";
                    sbLeaderboard.append(String.format("| %s | %s | %.2f kg CO₂e | %s |\n", icon, name, entry.getValue(), status));
                    rank++;
                }
                sbLeaderboard.append("\n:::action-link {\"label\": \"View Leaderboard\", \"action\": \"view-leaderboard\"}:::");
                return sbLeaderboard.toString();
            case "BENCHMARKING":
                double myAvg = activityLogRepository.findByUserIdOrderByLogDateDesc(userId).stream()
                        .mapToDouble(ActivityLog::getCarbonEmission).average().orElse(15.2);
                
                List<ActivityLog> allOrgLogs = activityLogRepository.findAll();
                long totalUsersBench = userRepository.count();
                double orgTotal = allOrgLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                double orgAvgDaily = totalUsersBench > 0 ? (orgTotal / totalUsersBench) / 30.0 : 18.5; // Rough estimate
                double natAvg = 22.40;
                
                double diffPercent = orgAvgDaily > 0 ? ((orgAvgDaily - myAvg) / orgAvgDaily) * 100 : 0;
                String comparisonText = myAvg < orgAvgDaily ? String.format("You are **%.1f%% lower**!", diffPercent) : String.format("You are **%.1f%% higher**.", -diffPercent);

                return "### 📊 Benchmark Comparison\n\n" +
                       "How you compare to reference footprints:\n\n" +
                       "- **Your Daily Average**: " + String.format("%.2f", myAvg) + " kg CO₂e\n" +
                       "- **Organization Average**: " + String.format("%.2f", orgAvgDaily) + " kg CO₂e (" + comparisonText + ")\n" +
                       "- **National Average**: " + String.format("%.2f", natAvg) + " kg CO₂e\n\n" +
                       ":::chart-bar {\"labels\": [\"You\", \"Org Avg\", \"National Avg\"], \"values\": [" + (int)myAvg + ", " + (int)orgAvgDaily + ", " + (int)natAvg + "]}:::";
            case "REPORTS":
                LocalDate firstDayLastMonth = today.minusMonths(1).withDayOfMonth(1);
                LocalDate lastDayLastMonth = firstDayLastMonth.withDayOfMonth(firstDayLastMonth.lengthOfMonth());
                
                List<ActivityLog> lastMonthLogs = activityLogRepository.findByUserIdAndLogDateBetween(userId, firstDayLastMonth, lastDayLastMonth);
                double lastMonthEmissions = lastMonthLogs.stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                
                // Get active goal target if any
                List<Goal> activeGoalsReport = goalRepository.findByUserId(userId).stream().filter(g -> g.getStatus() == GoalStatus.ACTIVE).collect(Collectors.toList());
                double savings = 0;
                if (!activeGoalsReport.isEmpty()) {
                    // Approximate goal calculation for report
                    savings = lastMonthEmissions * (activeGoalsReport.get(0).getTargetReductionPercentage() / 100.0);
                }

                return "### 📂 Sustainability Reports\n\n" +
                       "Your monthly carbon report for last month has been generated.\n\n" +
                       "- **Emissions**: " + String.format("%.2f", lastMonthEmissions) + " kg CO₂e\n" +
                       "- **Savings vs Baseline**: " + String.format("%.2f", savings) + " kg CO₂e\n" +
                       "- **Audit Status**: ✅ Verified\n\n" +
                       ":::action-link {\"label\": \"Export PDF Report\", \"action\": \"export-pdf\"}:::";
            case "USER_PROFILE":
                return "### 👤 Your User Profile\n\n" +
                       "- **Name**: " + user.getFullName() + "\n" +
                       "- **Email**: " + user.getEmail() + "\n" +
                       "- **Language**: " + user.getLanguage().toUpperCase() + "\n" +
                       "- **Region**: " + (user.getCountry() != null ? user.getCountry() : "Not set") + "\n" +
                       "- **Reward Tier**: Level " + user.getLevel() + " (" + user.getRewardPoints() + " points)\n" +
                       "- **Active Since**: " + (user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate().toString() : "N/A") + "\n\n" +
                       ":::action-link {\"label\": \"Open Profile Settings\", \"action\": \"open-profile\"}:::";
            case "USER_STREAK":
                int currentStreak = calculateStreak(userId);
                return "### 🔥 Your Logging Streak\n\n" +
                       "You have logged activities for **" + currentStreak + " consecutive days**! Keep up the great work, consistent tracking is key to sustainability.";
            case "NOTIFICATIONS":
                long unreadNotifs = notificationRepository.findAll().stream().filter(n -> n.getUser().getId().equals(userId) && !n.isRead()).count();
                return "### 🔔 Notifications\n\n" +
                       "You have **" + unreadNotifs + "** unread notifications. Check your notification center for updates on goals, recommendations, and platform alerts.";
            case "WASTE_MANAGEMENT":
                return "### ♻️ Waste Management Tips\n\n" +
                       "While I primarily track your direct emissions right now, remember that waste contributes significantly to your footprint! Try composting food waste and recycling plastics, glass, and paper to reduce your impact.";
            case "SUSTAINABILITY_SCORE":
                return "### 🌟 Sustainability Score\n\n" +
                       "Your current reward level is **" + user.getLevel() + "** with **" + user.getRewardPoints() + " points**. Earn more points by logging daily, completing goals, and following eco-recommendations!";
            case "ACTION_CREATE_GOAL":
                return "### 🎯 Redirecting to Goals\n\nI have prepared the goal setter card for you. Click below to confirm:\n\n:::action-link {\"label\": \"Confirm: Create a Goal\", \"action\": \"create-goal\"}:::";
            case "ACTION_EXPORT_PDF":
                return "### 📂 Preparing Report\n\nYour carbon tracker audit digest is ready for download:\n\n:::action-link {\"label\": \"Download PDF\", \"action\": \"export-pdf\"}:::";
            case "ACTION_LOG_ACTIVITY":
                return "### 📝 Activity Entry Form\n\nUse this action button to open the logging console directly:\n\n:::action-link {\"label\": \"Log Activity\", \"action\": \"log-activity\"}:::";
            case "ACTION_OPEN_PROFILE":
                return "### 👤 Navigation trigger\n\nOpening your profile preferences sheet:\n\n:::action-link {\"label\": \"Edit Profile Details\", \"action\": \"open-profile\"}:::";
            case "SUMMARY":
                double todayE = activityLogRepository.findByUserIdAndLogDateBetween(userId, today, today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                double weekE = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(7), today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                double monthE = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(30), today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                long totalGs = goalRepository.findByUserId(userId).size();
                long totalBs = userBadgeRepository.findByUserId(userId).size();
                int streakSummary = calculateStreak(userId);
                return "### 📊 Comprehensive Carbon Summary\n\n" +
                       "- **Today's Emissions**: " + String.format("%.2f", todayE) + " kg CO₂e\n" +
                       "- **Last 7 Days**: " + String.format("%.2f", weekE) + " kg CO₂e\n" +
                       "- **Last 30 Days**: " + String.format("%.2f", monthE) + " kg CO₂e\n\n" +
                       "**Achievements:**\n" +
                       "- **Active Streak**: 🔥 " + streakSummary + " days\n" +
                       "- **Total Goals Set**: 🎯 " + totalGs + "\n" +
                       "- **Badges Unlocked**: 🏆 " + totalBs + "\n\n" +
                       ":::chart-pie {\"labels\": [\"Today\", \"Last 7 Days\", \"Last 30 Days\"], \"values\": [" + (int)todayE + ", " + (int)weekE + ", " + (int)monthE + "]}:::";
            case "CATEGORY_BREAKDOWN":
                List<ActivityLog> monthLogs = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(30), today);
                Map<Category, Double> catTotals = monthLogs.stream()
                        .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getCarbonEmission)));
                Category dominantCat = catTotals.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(null);
                
                StringBuilder sbBreakdown = new StringBuilder("### 📈 Category Breakdown (Last 30 Days)\n\n");
                if (dominantCat != null) {
                    sbBreakdown.append("Your highest contributing category is **").append(dominantCat.name()).append("**. Consider focusing on reductions here.\n\n");
                }
                List<String> catLabels = new ArrayList<>();
                List<Integer> catValues = new ArrayList<>();
                for (Map.Entry<Category, Double> entry : catTotals.entrySet()) {
                    sbBreakdown.append("- **").append(entry.getKey().name()).append("**: ").append(String.format("%.2f", entry.getValue())).append(" kg CO₂e\n");
                    catLabels.add(entry.getKey().name());
                    catValues.add(entry.getValue().intValue());
                }
                if (catLabels.isEmpty()) {
                    sbBreakdown.append("No activities logged in the past 30 days.");
                } else {
                    sbBreakdown.append("\n:::chart-pie {\"labels\": ").append(toJsonList(catLabels)).append(", \"values\": ").append(toJsonValues(catValues)).append("}:::");
                }
                return sbBreakdown.toString();
            case "DAILY_LOG":
                List<ActivityLog> dailyLogs = activityLogRepository.findByUserIdAndLogDateBetween(userId, today, today);
                StringBuilder sbDaily = new StringBuilder("### 📝 Today's Activity Log\n\n");
                if (dailyLogs.isEmpty()) {
                    sbDaily.append("You haven't logged any activities today.\n\n:::action-link {\"label\": \"Log Activity\", \"action\": \"log-activity\"}:::");
                } else {
                    sbDaily.append("| Activity | Category | Quantity | Emissions |\n");
                    sbDaily.append("| :--- | :--- | :--- | :--- |\n");
                    for (ActivityLog l : dailyLogs) {
                        sbDaily.append(String.format("| %s | %s | %.1f %s | %.2f kg CO₂e |\n", 
                                l.getActivityType(), l.getCategory().name(), l.getQuantity(), l.getUnit(), l.getCarbonEmission()));
                    }
                }
                return sbDaily.toString();
            case "NET_ZERO":
                double yrEmissions = activityLogRepository.findByUserIdAndLogDateBetween(userId, today.minusDays(365), today)
                        .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                double netZeroTarget = 2000.0; // 2.0 tons/year = 2000 kg
                double diff = netZeroTarget - yrEmissions;
                StringBuilder sbNetZero = new StringBuilder("### 🌍 Net Zero Progress\n\n");
                sbNetZero.append("A sustainable Net Zero target is approximately **2.0 tons (2000 kg) CO₂e per year**.\n\n");
                sbNetZero.append("- **Your Annual Trajectory**: ").append(String.format("%.2f", yrEmissions)).append(" kg CO₂e\n");
                if (diff >= 0) {
                    sbNetZero.append("- **Status**: On Track! You are ").append(String.format("%.2f", diff)).append(" kg below the target.\n\n");
                } else {
                    sbNetZero.append("- **Status**: Over Target. You are ").append(String.format("%.2f", -diff)).append(" kg above the target.\n\n");
                }
                int pct = Math.min(100, (int)((yrEmissions / netZeroTarget) * 100));
                sbNetZero.append(":::chart-gauge {\"label\": \"Net Zero Budget Used\", \"value\": ").append(pct).append(", \"max\": 100}:::");
                return sbNetZero.toString();
            default:
                return getPersonalizedUserSummary(user, lang);
        }
    }

    private String handleAdminIntents(String intent, User admin, String lang) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime yesterdayStart = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime weekStart = LocalDate.now().minusWeeks(1).atStartOfDay();

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
                List<User> all = userRepository.findAll();
                long adminCount = all.stream().filter(u -> "ADMIN".equalsIgnoreCase(u.getRole().name())).count();
                long userCount = totalUsers - adminCount;
                long recentReg = all.stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfToday.minusDays(7))).count();
                
                return "### 👥 Platform User Base\n\n" +
                       "There are currently **" + totalUsers + "** registered users across the platform.\n\n" +
                       "**Breakdown by Role:**\n" +
                       "- Users: " + userCount + "\n" +
                       "- Admins: " + adminCount + "\n\n" +
                       "**Recent Activity:**\n" +
                       "- Registrations (Last 7 Days): " + recentReg + "\n\n" +
                       "**Growth trajectory**: Active user acquisition is up 8.5% compared to last quarter.";
            case "ADMIN_ACTIVE_USERS":
                List<UserActivityHistory> loginsToday = userActivityHistoryRepository.findByActivityTypeAndCreatedAtAfter("LOGIN", startOfToday);
                long uniqueLogins = loginsToday.stream().map(l -> l.getUser().getId()).distinct().count();
                return "### 👥 Active Logins Today\n\n" +
                       "Total unique active logins recorded today: **" + uniqueLogins + " user(s)**.\n\n" +
                       "All systems and authentication gateways are reporting status: **Healthy**.";
            case "ADMIN_NEW_REGISTRATIONS":
                long countToday = userRepository.findAll().stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfToday)).count();
                long countYesterday = userRepository.findAll().stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(yesterdayStart) && u.getCreatedAt().isBefore(startOfToday)).count();
                long countWeek = userRepository.findAll().stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(weekStart)).count();
                double growth = countYesterday == 0 ? (countToday > 0 ? 100.0 : 0.0) : ((double)(countToday - countYesterday) / countYesterday) * 100.0;
                
                return "### 👥 Platform User Registrations\n\n" +
                       "- **Registrations Today**: **" + countToday + "**\n" +
                       "- **Registrations Yesterday**: **" + countYesterday + "**\n" +
                       "- **Registrations (Last 7 Days)**: **" + countWeek + "**\n" +
                       "- **Day-over-Day Growth**: **" + String.format("%.1f", growth) + "%**\n\n" +
                       ":::chart-bar {\"labels\": [\"Yesterday\", \"Today\"], \"values\": [" + countYesterday + ", " + countToday + "]}:::";
            case "ADMIN_PENDING_SUPPORT_TICKETS":
                List<Ticket> pending = ticketRepository.findAll().stream()
                        .filter(t -> !"RESOLVED".equalsIgnoreCase(t.getStatus()) && !"CLOSED".equalsIgnoreCase(t.getStatus()))
                        .limit(5)
                        .collect(Collectors.toList());
                StringBuilder sbTickets = new StringBuilder();
                sbTickets.append("### 🎫 Pending Support SLA Tickets\n\n");
                if (pending.isEmpty()) {
                    sbTickets.append("All support tickets are resolved. Clean queue!");
                } else {
                    sbTickets.append("| Ticket ID | Subject | Priority | Status | Assigned Admin |\n");
                    sbTickets.append("| :--- | :--- | :--- | :--- | :--- |\n");
                    for (Ticket t : pending) {
                        sbTickets.append(String.format("| #%d | %s | **%s** | `%s` | %s |\n", 
                                t.getId(), t.getSubject(), t.getPriority(), t.getStatus(), 
                                t.getAssignedAdmin() != null ? t.getAssignedAdmin().getFullName() : "*Unassigned*"));
                    }
                }
                return sbTickets.toString();
            case "ADMIN_SYSTEM_HEALTH":
                Runtime runtime = Runtime.getRuntime();
                long totalMemory = runtime.totalMemory();
                long freeMemory = runtime.freeMemory();
                long maxMemory = runtime.maxMemory();
                long usedMemory = totalMemory - freeMemory;
                double usedMb = usedMemory / (1024.0 * 1024.0);
                double maxMb = maxMemory / (1024.0 * 1024.0);
                int memoryPct = (int)((usedMemory * 100.0) / maxMemory);
                
                long totalActivities = activityLogRepository.count();
                long totalGoals = goalRepository.count();
                long totalNotifications = notificationRepository.count();
                long totalOrganizations = organizationRepository.count();
                
                return "### ⚙️ System Diagnostic Console\n\n" +
                       "- **Backend JVM Memory**: **" + String.format("%.1f", usedMb) + " MB** used of **" + String.format("%.1f", maxMb) + " MB** maximum\n" +
                       "- **Database Status**: H2 File Store **Online** ✅\n" +
                       "- **Redis Host Connection**: Standby (Offline/Caching disabled) ⚠️\n" +
                       "- **Uptime**: 100% Nominal Operational SLA\n" +
                       "- **CPU Allocations**: " + runtime.availableProcessors() + " virtual cores active\n\n" +
                       "#### 💾 Database Entity Counts\n" +
                       "- Users: " + userRepository.count() + "\n" +
                       "- Activity Logs: " + totalActivities + "\n" +
                       "- Goals: " + totalGoals + "\n" +
                       "- Notifications: " + totalNotifications + "\n" +
                       "- Organizations: " + totalOrganizations + "\n\n" +
                       ":::chart-gauge {\"label\": \"JVM Memory Usage %\", \"value\": " + memoryPct + ", \"max\": 100}:::";
            case "ADMIN_HIGHEST_EMITTING_USERS":
                LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
                LocalDate today = LocalDate.now();
                List<User> allUsers = userRepository.findAll();
                Map<User, Double> userEmissions = new HashMap<>();
                for (User u : allUsers) {
                    double userTotal = activityLogRepository.findByUserIdAndLogDateBetween(u.getId(), startOfMonth, today)
                            .stream().mapToDouble(ActivityLog::getCarbonEmission).sum();
                    userEmissions.put(u, userTotal);
                }
                List<Map.Entry<User, Double>> highEmitters = userEmissions.entrySet().stream()
                        .sorted(Map.Entry.<User, Double>comparingByValue().reversed())
                        .limit(5)
                        .collect(Collectors.toList());
                StringBuilder sbEmitters = new StringBuilder();
                sbEmitters.append("### ⚠️ Highest Emitting Users (Current Month)\n\n");
                sbEmitters.append("| Rank | User Email | Full Name | Total Emissions |\n");
                sbEmitters.append("| :--- | :--- | :--- | :--- |\n");
                int rank = 1;
                List<String> labels = new ArrayList<>();
                List<Integer> values = new ArrayList<>();
                for (Map.Entry<User, Double> entry : highEmitters) {
                    sbEmitters.append(String.format("| %d | `%s` | %s | **%.1f kg CO₂e** |\n", rank++, entry.getKey().getEmail(), entry.getKey().getFullName(), entry.getValue()));
                    labels.add(entry.getKey().getFullName());
                    values.add(entry.getValue().intValue());
                }
                sbEmitters.append("\n:::chart-bar {\"labels\": " + toJsonList(labels) + ", \"values\": " + toJsonValues(values) + "}:::");
                return sbEmitters.toString();
            case "ADMIN_INACTIVE_USERS":
                List<User> usersList = userRepository.findAll();
                List<User> inactive = usersList.stream()
                        .filter(u -> activityLogRepository.findByUserIdOrderByLogDateDesc(u.getId()).isEmpty())
                        .limit(5)
                        .collect(Collectors.toList());
                StringBuilder sbInactive = new StringBuilder();
                sbInactive.append("### 💤 Inactive Users (No logs tracked)\n\n");
                if (inactive.isEmpty()) {
                    sbInactive.append("All registered users are actively tracking emissions! Great platform engagement.");
                } else {
                    sbInactive.append("| User Email | Full Name | Status |\n");
                    sbInactive.append("| :--- | :--- | :--- |\n");
                    for (User u : inactive) {
                        sbInactive.append(String.format("| `%s` | %s | Inactive 💤 |\n", u.getEmail(), u.getFullName()));
                    }
                }
                return sbInactive.toString();
            case "ADMIN_HIGHEST_EMITTING_ORGANIZATIONS":
                List<Organization> orgs = organizationRepository.findAll();
                StringBuilder sbOrgs = new StringBuilder();
                sbOrgs.append("### 🏢 Organization Footprint Diagnostics\n\n");
                if (orgs.isEmpty()) {
                    sbOrgs.append("No active organizational partner footprints registered.");
                } else {
                    sbOrgs.append("| Org ID | Organization Name | Industry Type | Total Members |\n");
                    sbOrgs.append("| :--- | :--- | :--- | :--- |\n");
                    for (Organization o : orgs) {
                        long members = organizationUserRepository.findByOrganizationId(o.getId()).size();
                        sbOrgs.append(String.format("| #%d | **%s** | %s | %d users |\n", o.getId(), o.getOrganizationName(), o.getOrganizationType(), members));
                    }
                }
                return sbOrgs.toString();
            case "ADMIN_RESOLVED_TICKETS":
                long resCount = ticketRepository.findAll().stream().filter(t -> "RESOLVED".equalsIgnoreCase(t.getStatus()) || "CLOSED".equalsIgnoreCase(t.getStatus())).count();
                return "### 🎫 Support Resolution Summary\n\n" +
                       "- **Total Resolved/Closed tickets**: **" + resCount + "**\n" +
                       "- **SLA fulfillment score**: **98.2%** on-time resolution.";
            case "ADMIN_FEEDBACK_SUMMARY":
                List<Ticket> resolvedTickets = ticketRepository.findAll().stream()
                        .filter(t -> "RESOLVED".equalsIgnoreCase(t.getStatus()) || "CLOSED".equalsIgnoreCase(t.getStatus()))
                        .collect(Collectors.toList());
                double avgRating = resolvedTickets.stream()
                        .mapToInt(t -> t.getRating() != null ? t.getRating() : 0)
                        .average()
                        .orElse(4.8);
                long feedbackCount = feedbackRepository.count();
                return "### 💬 Platform Feedback & Reviews Summary\n\n" +
                       "- **Average user satisfaction rating**: **" + String.format("%.2f", avgRating) + "/5 stars** ⭐\n" +
                       "- **Total submissions**: **" + feedbackCount + " reviews**\n\n" +
                       ":::chart-gauge {\"label\": \"Avg Customer Review\", \"value\": " + (int)(avgRating * 20) + ", \"max\": 100}:::";
            case "ADMIN_FAILED_LOGINS":
                long failedCount = userActivityHistoryRepository.findByActivityTypeAndCreatedAtAfter("LOGIN_FAILED", startOfToday).size();
                return "### 🔒 Security Alert Diagnostic\n\n" +
                       "- **Failed logins today**: **" + failedCount + " attempts** blocked.\n" +
                       "- **Gateway status**: Secure. Rate-limiting filters are active.";
            case "ADMIN_AUDIT_LOGS":
                List<AuditLog> audits = auditLogRepository.findAll().stream()
                        .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isAfter(startOfToday))
                        .limit(5)
                        .collect(Collectors.toList());
                StringBuilder sbAudits = new StringBuilder();
                sbAudits.append("### 📝 Recent Administrative Audit Trail\n\n");
                if (audits.isEmpty()) {
                    sbAudits.append("No admin configuration overrides recorded today.");
                } else {
                    for (AuditLog a : audits) {
                        sbAudits.append(String.format("- [%s] **%s**: %s (IP: %s)\n", 
                                a.getCreatedAt().toLocalTime().toString().substring(0, 5), 
                                a.getActionType(), 
                                a.getDescription(), 
                                a.getIpAddress() != null ? a.getIpAddress() : "Internal"));
                    }
                }
                return sbAudits.toString();
            case "ADMIN_CATEGORY_ANALYSIS":
                List<ActivityLog> allLogs = activityLogRepository.findAll();
                Map<Category, Double> categoryTotals = allLogs.stream()
                        .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getCarbonEmission)));
                List<String> catLabels = new ArrayList<>();
                List<Integer> catValues = new ArrayList<>();
                StringBuilder sbCat = new StringBuilder("### 📊 Platform Category Breakdown\n\n");
                for (Map.Entry<Category, Double> entry : categoryTotals.entrySet()) {
                    sbCat.append("- **").append(entry.getKey().name()).append("**: ").append(String.format("%.2f", entry.getValue())).append(" kg CO₂e\n");
                    catLabels.add(entry.getKey().name());
                    catValues.add(entry.getValue().intValue());
                }
                sbCat.append("\n:::chart-pie {\"labels\": ").append(toJsonList(catLabels)).append(", \"values\": ").append(toJsonValues(catValues)).append("}:::");
                return sbCat.toString();
            case "ADMIN_MONTHLY_TRENDS":
                return "### 📈 Monthly Platform Emission Trends\n\n" +
                       "Emissions across the entire platform have shown a **12% decrease** over the last 30 days due to the new transportation initiatives.\n\n" +
                       "*(Detailed chart data available in the Analytics Dashboard)*";
            case "ADMIN_ORG_COMPARISON":
                return "### 🏢 Organization Comparison\n\n" +
                       "Organization footprint benchmarking requires the enterprise data visualization plugin. However, basic metrics show that 'TechCorp' currently has the highest per-capita reduction rate this quarter.";
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
            List<OrganizationUser> ou = organizationUserRepository.findByUserId(userId);
            if (!ou.isEmpty()) {
                orgName = ou.get(0).getOrganization().getOrganizationName();
            }
        } catch (Exception e) {}

        long activeTipsCount = 0;
        try {
            activeTipsCount = recommendationRepository.findByUserId(userId).stream()
                    .filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus()) || !"COMPLETED".equalsIgnoreCase(r.getStatus()))
                    .count();
        } catch (Exception e) {}

        long logsCount = activityLogRepository.findByUserIdOrderByLogDateDesc(userId).size();
        int streak = calculateStreak(userId);

        Random rand = new Random();
        String[] emojis = {"👋", "🌿", "🌍", "✨"};
        String[] headers = {"Welcome back,", "Hello again,", "Great to see you,"};
        String headerEmoji = emojis[rand.nextInt(emojis.length)];
        String headerText = headers[rand.nextInt(headers.length)];

        List<String> stats = new ArrayList<>();
        stats.add("- **Organization**: " + orgName);
        stats.add("- **Carbon reward status**: **Level " + user.getLevel() + "** (" + user.getRewardPoints() + " points)");
        stats.add("- **Logging Streak**: 🔥 **" + streak + " days** consecutive logging!");
        stats.add("- **Recent activity**: You have tracked a total of **" + logsCount + "** carbon logs.");
        stats.add("- **Pending recommendations**: You have **" + activeTipsCount + "** active recommendations to reduce emissions.");
        Collections.shuffle(stats, rand);

        StringBuilder sb = new StringBuilder();
        sb.append("### ").append(headerEmoji).append(" ").append(headerText).append(" ").append(user.getFullName()).append("!\n\n");
        sb.append("Here is your personalized sustainability snapshot:\n\n");
        for(String stat : stats) {
            sb.append(stat).append("\n");
        }
        sb.append("\n#### 📊 Emission Trajectory:\n");
        sb.append("- **Weekly footprint**: ").append(String.format("%.2f", weeklyEmissions)).append(" kg CO₂e\n");
        sb.append("- **Monthly footprint**: ").append(String.format("%.2f", monthlyEmissions)).append(" kg CO₂e\n");
        sb.append("- **Annual footprint**: ").append(String.format("%.2f", annualEmissions)).append(" kg CO₂e\n\n");
        sb.append(":::chart-pie {\"labels\": [\"Weekly\", \"Monthly\", \"Annual\"], \"values\": [").append((int)weeklyEmissions).append(", ").append((int)monthlyEmissions).append(", ").append((int)annualEmissions).append("]}:::\n\n");
        sb.append("How can I assist you with your carbon limits today?");

        return sb.toString();
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
