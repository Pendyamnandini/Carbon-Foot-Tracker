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

    @PutMapping("/conversations/{id}/rename")
    public ResponseEntity<ApiResponse<AiConversationDto>> renameConversation(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, String> body) {
        String title = body.get("title");
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        AiConversationDto dto = conversationService.renameConversation(id, title);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping("/conversations/{id}/pin")
    public ResponseEntity<ApiResponse<AiConversationDto>> pinConversation(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, Boolean> body) {
        Boolean pinned = body.get("pinned");
        if (pinned == null) pinned = false;
        AiConversationDto dto = conversationService.pinConversation(id, pinned);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping("/conversations/{id}/favorite")
    public ResponseEntity<ApiResponse<AiConversationDto>> favoriteConversation(
            @PathVariable("id") Long id,
            @RequestBody java.util.Map<String, Boolean> body) {
        Boolean favorite = body.get("favorite");
        if (favorite == null) favorite = false;
        AiConversationDto dto = conversationService.favoriteConversation(id, favorite);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping("/messages/{messageId}/feedback")
    public ResponseEntity<ApiResponse<ChatMessageDto>> setMessageFeedback(
            @PathVariable("messageId") Long messageId,
            @RequestBody java.util.Map<String, Boolean> body) {
        Boolean liked = body.get("liked");
        Boolean disliked = body.get("disliked");
        ChatMessageDto dto = conversationService.setFeedback(messageId, liked != null && liked, disliked != null && disliked);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @Autowired
    private com.carbontracker.service.FileStorageService fileStorageService;

    @PostMapping("/conversations/{id}/upload")
    public ResponseEntity<ApiResponse<ChatMessageDto>> uploadFileToConversation(
            @PathVariable("id") Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        User user = getCurrentUser();
        com.carbontracker.entity.UploadedFile uploadedFile = fileStorageService.storeFile(file, user);

        String filename = file.getOriginalFilename();
        String fileType = file.getContentType();
        String fileContentSummary = "";

        try {
            if (fileType != null && (fileType.contains("text") || fileType.contains("csv") || filename.endsWith(".csv") || filename.endsWith(".txt"))) {
                byte[] bytes = file.getBytes();
                String text = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                String[] lines = text.split("\n");
                java.util.List<String> firstLines = new java.util.ArrayList<>();
                for (int i = 0; i < Math.min(20, lines.length); i++) {
                    firstLines.add(lines[i]);
                }
                fileContentSummary = String.join("\n", firstLines);
            } else {
                fileContentSummary = "[Binary file of type " + fileType + " (size: " + file.getSize() + " bytes)]";
            }
        } catch (Exception e) {
            fileContentSummary = "[Could not extract content: " + e.getMessage() + "]";
        }

        // Log user uploaded message
        String fileLinkMarkdown = "Uploaded file: **[" + filename + "](" + uploadedFile.getFileUrl() + ")**";
        conversationService.addMessage(id, "USER", fileLinkMarkdown);

        // Generate response based on content
        String botResponse = generateFileAnalysisResponse(filename, fileType, fileContentSummary);
        ChatMessageDto botMsg = conversationService.addMessage(id, "BOT", botResponse);

        return ResponseEntity.ok(ApiResponse.success(botMsg));
    }

    private String generateFileAnalysisResponse(String filename, String fileType, String content) {
        User user = getCurrentUser();
        String systemPrompt = promptBuilder.buildSystemPrompt(user, "USER") + 
            "\nAnalyze the uploaded file based on its content and provide sustainability insights.";
        String prompt = "Uploaded File: " + filename + "\nType: " + fileType + "\nContent Summary:\n" + content;
        return aiProvider.generateResponse(systemPrompt, prompt, java.util.Collections.emptyList());
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/test-db")
    public ResponseEntity<String> testDb() {
        try {
            Integer convCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ai_conversations", Integer.class);
            Integer msgCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ai_messages", Integer.class);
            return ResponseEntity.ok("DB Status: OK. ai_conversations count = " + convCount + ", ai_messages count = " + msgCount);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.ok("DB Status: ERROR. Details:\n" + sw.toString());
        }
    }
}
