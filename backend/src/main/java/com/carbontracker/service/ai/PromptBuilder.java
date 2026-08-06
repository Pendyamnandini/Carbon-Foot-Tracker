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

        // Multilingual response instruction based on user language preference
        String language = user.getLanguage();
        if (language == null || language.isEmpty()) {
            language = "en";
        }
        sb.append("\n== CRITICAL MULTILINGUAL INSTRUCTION ==\n");
        sb.append("The user's preferred language is: '").append(language).append("'.\n");
        sb.append("You MUST write your entire response, recommendations, explanations, and advice ONLY in this language: '").append(language).append("'.\n");
        sb.append("Do NOT prepend any language tags like [French], [Hindi], or [Spanish] or similar prefixes. Just output the translated text naturally.\n");
        sb.append("Do NOT mix English words unless they are technical metrics or standard acronyms (e.g. CO2, kg). Speak directly in the target language.\n");

        return sb.toString();
    }
}
