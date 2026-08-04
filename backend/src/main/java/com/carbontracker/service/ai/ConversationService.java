package com.carbontracker.service.ai;

import com.carbontracker.dto.AiConversationDto;
import com.carbontracker.dto.ChatMessageDto;
import com.carbontracker.entity.AiConversation;
import com.carbontracker.entity.AiMessage;
import com.carbontracker.repository.AiConversationRepository;
import com.carbontracker.repository.AiMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConversationService {

    @Autowired
    private AiConversationRepository aiConversationRepository;

    @Autowired
    private AiMessageRepository aiMessageRepository;

    public List<AiConversationDto> getConversations(Long userId, String role) {
        return aiConversationRepository.findByUserIdAndRoleOrderByCreatedAtDesc(userId, role)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AiConversationDto getConversation(Long id) {
        AiConversation conv = aiConversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        return mapToDto(conv);
    }

    public AiConversationDto createConversation(Long userId, String role, String title) {
        AiConversation conv = AiConversation.builder()
                .userId(userId)
                .role(role)
                .title(title != null && !title.trim().isEmpty() ? title : "New Conversation")
                .build();
        conv = aiConversationRepository.save(conv);
        return mapToDto(conv);
    }

    public ChatMessageDto addMessage(Long conversationId, String sender, String content) {
        AiConversation conv = aiConversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        AiMessage msg = AiMessage.builder()
                .conversationId(conversationId)
                .sender(sender)
                .content(content)
                .build();
        msg = aiMessageRepository.save(msg);

        // Update conversation title if it was default
        if ("New Conversation".equals(conv.getTitle()) && "USER".equalsIgnoreCase(sender)) {
            String shortTitle = content.length() > 30 ? content.substring(0, 27) + "..." : content;
            conv.setTitle(shortTitle);
            aiConversationRepository.save(conv);
        }

        return new ChatMessageDto(msg.getSender(), msg.getContent(), msg.getCreatedAt());
    }

    public void deleteConversation(Long conversationId) {
        aiMessageRepository.deleteByConversationId(conversationId);
        aiConversationRepository.deleteById(conversationId);
    }

    private AiConversationDto mapToDto(AiConversation conv) {
        List<ChatMessageDto> messages = aiMessageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId())
                .stream()
                .map(m -> new ChatMessageDto(m.getSender(), m.getContent(), m.getCreatedAt()))
                .collect(Collectors.toList());

        return AiConversationDto.builder()
                .id(conv.getId())
                .title(conv.getTitle())
                .role(conv.getRole())
                .createdAt(conv.getCreatedAt())
                .messages(messages)
                .build();
    }
}
