package com.carbontracker.dto;

import lombok.Data;

@Data
public class TicketFeedbackRequest {
    private Integer rating;
    private String feedbackText;
}
