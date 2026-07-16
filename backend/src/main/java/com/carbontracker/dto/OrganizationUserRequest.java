package com.carbontracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationUserRequest {
    @NotBlank(message = "User email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Role must be ORG_ADMIN or ORG_USER")
    private String role; // ORG_ADMIN or ORG_USER
}
