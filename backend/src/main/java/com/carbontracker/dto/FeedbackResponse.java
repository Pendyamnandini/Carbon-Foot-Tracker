package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String feedbackText;
    private String category;
    private String status;
    private LocalDateTime createdAt;
}
