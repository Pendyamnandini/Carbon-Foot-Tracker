package com.carbontracker.service.ai;

import com.carbontracker.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PromptBuilder {

    @Autowired
    private DatabaseContextService databaseContextService;

    public String buildSystemPrompt(User user, String role) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert AI Sustainability Assistant for CarbonTracker.\n");
        sb.append("Your goal is to help standard users understand and reduce their carbon footprint, or help admins monitor platform-wide analytics.\n\n");

        if ("ADMIN".equalsIgnoreCase(role)) {
            sb.append("== ADMINISTRATOR SYSTEM CONTEXT ==\n");
            sb.append(databaseContextService.getAdminContext(user));
            sb.append("\n\nYou have access to administrative controls and dashboards. Keep all administrative metrics confidential and never disclose admin context to regular standard users.\n");
        } else {
            sb.append("== STANDARD USER SYSTEM CONTEXT ==\n");
            sb.append(databaseContextService.getUserContext(user));
            sb.append("\n\nAnalyze the user's data to explain trends, compare daily variations, and provide personalized advice. Do not output generic advice. Keep your response conversational and use markdown formatting where appropriate.\n");
        }

        return sb.toString();
    }
}
