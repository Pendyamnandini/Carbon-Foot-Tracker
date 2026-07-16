package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationResponse {
    private Long id;
    private String organizationName;
    private String organizationType;
    private LocalDateTime createdAt;
}
