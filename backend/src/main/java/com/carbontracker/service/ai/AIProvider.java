package com.carbontracker.service.ai;

import com.carbontracker.dto.ChatMessageDto;
import java.util.List;

public interface AIProvider {
    String generateResponse(String systemPrompt, String userMessage, List<ChatMessageDto> history);
}
