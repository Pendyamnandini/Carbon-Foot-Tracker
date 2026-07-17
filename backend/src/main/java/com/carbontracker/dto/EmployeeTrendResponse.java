package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeTrendResponse {
    private Long employeeId;
    private String employeeName;
    private List<AdminDashboardV1Response.TimeValue> emissionsOverTime;
}
