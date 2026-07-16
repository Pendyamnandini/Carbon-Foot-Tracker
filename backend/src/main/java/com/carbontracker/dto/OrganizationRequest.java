package com.carbontracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationRequest {
    @NotBlank(message = "Organization name is required")
    private String organizationName;
    private String organizationType;
}
