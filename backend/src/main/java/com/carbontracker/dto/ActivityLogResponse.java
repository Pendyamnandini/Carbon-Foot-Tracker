package com.carbontracker.dto;

import com.carbontracker.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogResponse {
    private Long id;
    private Long userId;
    private Category category;
    private String activityType;
    private double quantity;
    private String unit;
    private double emissionFactor;
    private double carbonEmission;
    private LocalDate logDate;
}
