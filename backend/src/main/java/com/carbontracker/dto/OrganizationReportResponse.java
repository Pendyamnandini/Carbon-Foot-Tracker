package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationReportResponse {
    private Long id;
    private Long organizationId;
    private int reportMonth;
    private int reportYear;
    private double totalEmission;
}
