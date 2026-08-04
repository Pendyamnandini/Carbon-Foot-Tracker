package com.carbontracker.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String mobileNumber;
    private String sustainabilityPreferences;
    private LocalDate dateOfBirth;
    private String gender;
    private String country;
    private String state;
    private String city;
    private String profileImageUrl;
    private String language;
}
