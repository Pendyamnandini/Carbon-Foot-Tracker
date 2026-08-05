package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private String sender;
    private String content;
    private boolean liked;
    private boolean disliked;
    private LocalDateTime createdAt;
}
