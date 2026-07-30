package com.carbontracker.dto;

import lombok.Data;

@Data
public class TicketUpdateRequest {
    private String status;
    private String priority;
    private Long assignedAdminId;
}
