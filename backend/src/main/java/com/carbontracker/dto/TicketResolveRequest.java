package com.carbontracker.dto;

import lombok.Data;

@Data
public class TicketResolveRequest {
    private String rootCause;
    private String problemAnalysis;
    private String resolutionSteps;
    private String changesMade;
    private String verificationPerformed;
    private String finalNotes;
    private String additionalResources;
    private String attachmentBase64;
    private String attachmentName;
}
