package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalResponse {
    private Long id;
    private Long userId;
    private String goalTitle;
    private double targetReductionPercentage;
    private LocalDate startDate;
    private LocalDate targetDate;
    private double currentProgress;
    private String status;
}
