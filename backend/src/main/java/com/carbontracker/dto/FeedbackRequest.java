package com.carbontracker.dto;

import com.carbontracker.entity.FeedbackCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackRequest {

    @NotBlank(message = "Feedback text is required")
    private String feedbackText;

    @NotNull(message = "Feedback category is required")
    private FeedbackCategory category;
}
