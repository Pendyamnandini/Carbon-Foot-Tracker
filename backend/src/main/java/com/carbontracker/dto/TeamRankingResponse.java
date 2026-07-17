package com.carbontracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamRankingResponse {
    private int rank;
    private String employeeName;
    private String department;
    private double emissions;
    private double sustainabilityScore;
}
