package com.carbontracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentPerformanceResponse {
    private String departmentName;
    private double totalEmissions;
    private double averageEmissions;
    private int employeeCount;
}
