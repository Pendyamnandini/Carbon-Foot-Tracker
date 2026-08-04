package com.carbontracker.service.ai;

import com.carbontracker.dto.ChatMessageDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LocalHybridAIProvider implements AIProvider {

    @Override
    public String generateResponse(String systemPrompt, String userMessage, List<ChatMessageDto> history) {
        String msg = userMessage.toLowerCase().trim();

        // 1. Identify context values from the compiled system prompt
        String userName = getValueFromPrompt(systemPrompt, "User Name: (.*)");
        String userRole = getValueFromPrompt(systemPrompt, "User Role: (.*)");
        String todayEmissions = getValueFromPrompt(systemPrompt, "Today's Emissions: (.*)");
        String yesterdayEmissions = getValueFromPrompt(systemPrompt, "Yesterday's Emissions: (.*)");
        String highestCategory = getValueFromPrompt(systemPrompt, "Highest Category: (.*)");
        String activeGoals = getValueFromPrompt(systemPrompt, "Active Goals: (.*)");
        String recentChanges = getValueFromPrompt(systemPrompt, "Recent Audit Logs: (.*)");
        String activeUsersToday = getValueFromPrompt(systemPrompt, "Active Users Logged In Today: (.*)");
        String activeUserDetails = getValueFromPrompt(systemPrompt, "User Logins Details: (.*)");
        String totalUsers = getValueFromPrompt(systemPrompt, "Total Registered Users: (.*)");
        String pendingTickets = getValueFromPrompt(systemPrompt, "Pending Support Tickets: (.*)");

        // 2. Route based on Administrator questions
        if ("admin".equalsIgnoreCase(userRole)) {
            if (msg.contains("user") && (msg.contains("log") || msg.contains("active") || msg.contains("today"))) {
                return "### 👥 Active Users Today\n\n" +
                       "There are currently **" + activeUsersToday + "** user(s) logged in today.\n\n" +
                       "**Login Details:**\n" + activeUserDetails;
            }
            if (msg.contains("total") || msg.contains("registration") || msg.contains("grow")) {
                return "### 📊 Platform Growth Statistics\n\n" +
                       "- **Total Registered Users:** " + totalUsers + "\n" +
                       "- **Active Sessions Today:** " + activeUsersToday + "\n\n" +
                       "The user registration metrics show stable growth across standard and corporate organizational portal channels.";
            }
            if (msg.contains("ticket") || msg.contains("support") || msg.contains("pending")) {
                return "### 🎫 Support Operations Summary\n\n" +
                       "- **Pending/Unresolved Tickets:** " + pendingTickets + " ticket(s) currently open.\n\n" +
                       "Admins are advised to review ticket pipelines to resolve high-priority requests.";
            }
            if (msg.contains("stat") || msg.contains("recent") || msg.contains("activ")) {
                return "### ⚙️ Recent System Activities\n\n" +
                       "System monitoring logs register **" + activeUsersToday + "** active login(s) and operational changes in database indexes. No pending security alerts.";
            }
            return "Hello Admin **" + userName + "**! As a system administrator, you can query platform metrics such as active users logged in today, ticket status, registrations, and recent operations. How can I assist you today?";
        }

        // 3. Route based on Standard User questions
        if (msg.contains("today") && (msg.contains("emission") || msg.contains("carbon") || msg.contains("footprint"))) {
            double em = parseDoubleOrZero(todayEmissions);
            if (em == 0.0) {
                return "You have recorded **0.0 kg CO₂e** in carbon emissions today. Great job! Keep logging your activities to maintain a clear sustainability overview.";
            }
            return "Your carbon footprint today is **" + todayEmissions + " kg CO₂e**. " +
                   (highestCategory.isEmpty() ? "" : "Your highest source of emissions is **" + highestCategory + "**.") +
                   " Try using public transit or energy-saving utilities to reduce this further.";
        }

        if (msg.contains("yesterday") && (msg.contains("emission") || msg.contains("carbon") || msg.contains("footprint"))) {
            double em = parseDoubleOrZero(yesterdayEmissions);
            if (em == 0.0) {
                return "You have recorded **0.0 kg CO₂e** in carbon emissions for yesterday. Keep logging daily utilities and transport to get accurate historical trends.";
            }
            return "Your carbon footprint yesterday was **" + yesterdayEmissions + " kg CO₂e**. " +
                   "Compared to today (" + todayEmissions + " kg CO₂e), this represents a key shift. Analyzing this variation helps target high-impact reduction opportunities.";
        }

        if (msg.contains("log") || msg.contains("change") || msg.contains("did i")) {
            if (recentChanges == null || recentChanges.trim().isEmpty() || recentChanges.contains("None")) {
                return "My records show **no login activity or activity log modifications** recorded in your audit logs for today. Let's start by adding a new log under the **Activity Logs** tab!";
            }
            return "Here is your recent activity and modification history:\n\n" + recentChanges;
        }

        if (msg.contains("goal") || msg.contains("progress")) {
            return "### 🎯 Goal Completion Status\n\n" +
                   "You currently have **" + activeGoals + "** active targets.\n\n" +
                   "Verify your progress timeline inside the **Goals** dashboard tab to see details of completed reductions and current achievements.";
        }

        if (msg.contains("eco") || msg.contains("score")) {
            return "### ♻️ Eco Score Breakdown\n\n" +
                   "Your sustainability Eco Score is calculated from active goals, reduction streaks, and daily transportation limits.\n\n" +
                   "To boost your score, replace vehicle trips with walks/bicycles and complete reduction challenges.";
        }

        if (msg.contains("recommend") || msg.contains("improve")) {
            return "### 💡 Personalized Carbon Reduction Recommendations\n\n" +
                   "- **Transport (High Impact):** Transition car trips to public transit or carpooling. Replacing 2 weekly car trips can save approximately **20 kg CO₂e** monthly.\n" +
                   "- **Utilities (Medium Impact):** Reduce thermostat settings by 1°C and switch off standby electronics to save electricity.\n" +
                   "- **Diet (Low Impact):** Choose locally sourced vegetables to lower supply chain carbon outputs.";
        }

        // 4. Sustainability Glossary
        if (msg.contains("net zero")) {
            return "### 🌍 What is Net Zero?\n\n" +
                   "**Net Zero** means achieving a balance between the greenhouse gases put into the atmosphere and those taken out. " +
                   "It requires cutting emissions close to zero, with any remaining emissions re-absorbed by oceans and forests (or technology like carbon capture).";
        }
        if (msg.contains("carbon credit")) {
            return "### 🎫 What is a Carbon Credit?\n\n" +
                   "A **Carbon Credit** is a permit representing the right to emit **one tonne of carbon dioxide (CO₂)** or equivalent greenhouse gases. " +
                   "Companies buy credits to offset emissions they cannot eliminate, funding reforestation and clean energy projects elsewhere.";
        }
        if (msg.contains("offset")) {
            return "### ♻️ What is Carbon Offsetting?\n\n" +
                   "**Carbon Offsetting** is the action of compensating for carbon dioxide emissions by participating in or funding schemes designed to make equivalent reductions in the atmosphere " +
                   "(e.g., planting trees, protecting ecosystems, or building solar farms).";
        }
        if (msg.contains("climate change") || msg.contains("greenhouse")) {
            return "### 🔥 Greenhouse Gases & Climate Change\n\n" +
                   "Greenhouse gases (like CO₂, methane, and water vapor) trap heat in the atmosphere. This is the **greenhouse effect**, " +
                   "which drives global temperatures upward, causing severe climate shifts, rising sea levels, and ecosystem disruptions.";
        }

        // 5. Default General Response
        return "Hello **" + userName + "**! I am your AI Carbon Assistant. I can track your daily footprint, explain charts, summarize goals, and give personalized sustainability tips.\n\n" +
               "**Currently Tracked Metrics:**\n" +
               "- Today's Footprint: **" + todayEmissions + " kg CO₂e**\n" +
               "- Yesterday's Footprint: **" + yesterdayEmissions + " kg CO₂e**\n" +
               "- Active Targets: **" + activeGoals + "**\n\n" +
               "Ask me anything about your emissions, goals, recent logins/changes, or general sustainability concepts!";
    }

    private String getValueFromPrompt(String prompt, String regex) {
        try {
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(prompt);
            if (matcher.find()) {
                return matcher.group(1).trim();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "";
    }

    private double parseDoubleOrZero(String value) {
        try {
            return Double.parseDouble(value.replaceAll("[^0-9.]", ""));
        } catch (Exception e) {
            return 0.0;
        }
    }
}
