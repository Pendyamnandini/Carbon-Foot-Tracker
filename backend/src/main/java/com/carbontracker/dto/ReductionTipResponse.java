package com.carbontracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReductionTipResponse {
    private String action;
    private String estimatedSavings;
    private String difficulty; // Easy, Medium, High
    private String impact; // Low, Medium, High
    private String category; // TRANSPORT, ELECTRICITY, FOOD, SHOPPING
}
