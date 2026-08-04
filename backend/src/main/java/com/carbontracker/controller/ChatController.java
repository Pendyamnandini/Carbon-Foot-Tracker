package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.ai.AIProvider;
import com.carbontracker.service.ai.ConversationService;
import com.carbontracker.service.ai.PromptBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
public class ChatController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private PromptBuilder promptBuilder;

    @Autowired
    private AIProvider aiProvider;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<AiConversationDto>>> getConversations(@RequestParam(value = "role", defaultValue = "USER") String role) {
        User user = getCurrentUser();
        // Fallback to checking admin role if role parameter is not provided or set to USER
        String activeRole = role;
        if ("ADMIN".equalsIgnoreCase(user.getRole().name())) {
            activeRole = "ADMIN";
        }
        List<AiConversationDto> list = conversationService.getConversations(user.getId(), activeRole);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<AiConversationDto>> getConversation(@PathVariable("id") Long id) {
        AiConversationDto dto = conversationService.getConversation(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse<AiConversationDto>> createConversation(@RequestParam(value = "role", defaultValue = "USER") String role, @RequestBody(required = false) java.util.Map<String, String> body) {
        User user = getCurrentUser();
        String activeRole = role;
        if ("ADMIN".equalsIgnoreCase(user.getRole().name())) {
            activeRole = "ADMIN";
        }
        String title = body != null ? body.get("title") : "New Conversation";
        AiConversationDto dto = conversationService.createConversation(user.getId(), activeRole, title);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/conversations/{id}/query")
    public ResponseEntity<ApiResponse<ChatMessageDto>> queryConversation(@PathVariable("id") Long id, @RequestBody AiQueryRequest request) {
        User user = getCurrentUser();
        AiConversationDto conv = conversationService.getConversation(id);

        if (!conv.getRole().equalsIgnoreCase(user.getRole().name()) && !"ADMIN".equalsIgnoreCase(user.getRole().name())) {
            throw new IllegalArgumentException("Unauthorized access to conversation role context");
        }

        // 1. Log the user message in DB
        conversationService.addMessage(id, "USER", request.getMessage());

        // 2. Build contextual prompt
        String systemPrompt = promptBuilder.buildSystemPrompt(user, conv.getRole());

        // 3. Generate response via AI layer
        String botResponse = aiProvider.generateResponse(systemPrompt, request.getMessage(), conv.getMessages());

        // 4. Log the bot response in DB
        ChatMessageDto botMsg = conversationService.addMessage(id, "BOT", botResponse);

        return ResponseEntity.ok(ApiResponse.success(botMsg));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<String>> deleteConversation(@PathVariable("id") Long id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.ok(ApiResponse.success("Conversation deleted successfully", null));
    }
}
