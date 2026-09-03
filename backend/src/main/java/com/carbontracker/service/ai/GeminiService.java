package com.carbontracker.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public String analyzeText(String text, String systemPrompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return fallbackAnalyze(text);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
            
            Map<String, Object> request = new HashMap<>();
            String prompt = systemPrompt + "\n\nUser Input: " + text;
            
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            Map<String, Object> content = new HashMap<>();
            content.put("parts", new Object[]{part});
            request.put("contents", new Object[]{content});

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return extractTextFromGeminiResponse(response.getBody());
        } catch (Exception e) {
            System.err.println("Gemini API error: " + e.getMessage());
            return fallbackAnalyze(text);
        }
    }

    private String extractTextFromGeminiResponse(String responseJson) {
        try {
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(responseJson);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            return "{}";
        }
    }

    private String fallbackAnalyze(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("bus")) {
            return "{\"category\":\"TRANSPORT\", \"activityType\":\"Bus Travel\", \"quantity\": 40}";
        } else if (lower.contains("car") || lower.contains("transport")) {
            return "{\"category\":\"TRANSPORT\", \"activityType\":\"Car Travel\", \"quantity\": 20}";
        } else if (lower.contains("flight") || lower.contains("fly") || lower.contains("plane")) {
            return "{\"category\":\"TRANSPORT\", \"activityType\":\"Air Travel\", \"quantity\": 500}";
        } else if (lower.contains("electricity") || lower.contains("power") || lower.contains("energy")) {
            return "{\"category\":\"ELECTRICITY\", \"activityType\":\"Home Electricity\", \"quantity\": 150}";
        } else if (lower.contains("food") || lower.contains("meat") || lower.contains("beef") || lower.contains("meal")) {
            return "{\"category\":\"FOOD\", \"activityType\":\"High-Impact Meal\", \"quantity\": 5}";
        }
        return "{}";
    }
}
