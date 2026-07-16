package com.carbontracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class GoalRequest {

    @NotBlank(message = "Goal title is required")
    private String goalTitle;

    @NotNull(message = "Target reduction percentage is required")
    private Double targetReductionPercentage;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Target date is required")
    private LocalDate targetDate;
}
