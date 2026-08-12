package com.carbontracker.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class OrgActivityResponse {
    private Long id;
    private String userName;
    private String userEmail;
    private String category;
    private String activityType;
    private Double quantity;
    private String unit;
    private Double carbonEmission;
    private LocalDate logDate;
    private LocalDateTime createdAt;
}
