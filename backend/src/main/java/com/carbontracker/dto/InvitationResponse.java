package com.carbontracker.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InvitationResponse {
    private Long id;
    private String organizationName;
    private String email;
    private String invitedByName;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
