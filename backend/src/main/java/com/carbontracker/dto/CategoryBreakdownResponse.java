package com.carbontracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBreakdownResponse {
    private String category;
    private double emissionValue;
    private double percentageContribution;
}
