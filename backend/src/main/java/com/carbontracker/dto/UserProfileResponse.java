package com.carbontracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String role;
    private String profileImageUrl;
    private String sustainabilityPreferences;
    private boolean active;
    private LocalDate dateOfBirth;
    private String gender;
    private String country;
    private String state;
    private String city;
}
