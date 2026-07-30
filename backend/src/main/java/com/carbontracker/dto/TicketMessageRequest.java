package com.carbontracker.dto;

import lombok.Data;

@Data
public class TicketMessageRequest {
    private String messageText;
    private String attachmentName;
    private String attachmentBase64;
}
