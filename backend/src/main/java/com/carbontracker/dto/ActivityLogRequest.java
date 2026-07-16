package com.carbontracker.dto;

import com.carbontracker.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ActivityLogRequest {

    @NotNull(message = "Category is required")
    private Category category;

    @NotBlank(message = "Activity type is required")
    private String activityType;

    @NotNull(message = "Quantity is required")
    private Double quantity;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;
}
