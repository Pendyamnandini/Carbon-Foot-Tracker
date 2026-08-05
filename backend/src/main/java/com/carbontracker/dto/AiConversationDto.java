package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiConversationDto {
    private Long id;
    private String title;
    private String role;
    private boolean pinned;
    private boolean favorite;
    private LocalDateTime createdAt;
    private List<ChatMessageDto> messages;
}
