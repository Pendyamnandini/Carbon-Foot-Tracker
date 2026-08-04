package com.carbontracker.dto;

import com.carbontracker.entity.Ticket;
import com.carbontracker.entity.TicketMessage;
import com.carbontracker.entity.TicketTimeline;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponse {
    private Long id;
    private String ticketId;
    private String subject;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String deviceInfo;
    private String browserInfo;
    private String appVersion;
    private String username;
    private String userEmail;
    private String assignedAdminName;
    private LocalDateTime assignedAt;
    private Integer rating;
    private String feedbackText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private LocalDateTime resolvedAt;
    private String resolvedByName;
    private String resolutionMessage;
    private Long timeTakenMinutes;
    private String issueSummary;
    private String rootCause;
    private String resolutionAction;
    private String resolutionResult;
    private String problemAnalysis;
    private String resolutionSteps;
    private String changesMade;
    private String verificationPerformed;
    private String finalNotes;
    private String additionalResources;
    private String resolutionAttachmentUrl;
    private String resolutionAttachmentName;
    private Integer aiConfidenceScore;
    private String aiEstimatedTime;
    private String aiHelpfulResources;
    private String aiSeverity;
    private String aiPreventiveAdvice;
    private LocalDateTime aiGeneratedAt;
    private Boolean isAiResolved;
    private String affectedModule;

    private List<TicketMessage> messages;
    private List<TicketTimeline> timeline;

    public static TicketResponse from(Ticket t, List<TicketMessage> msgs, List<TicketTimeline> timelineList) {
        TicketResponse res = new TicketResponse();
        res.setId(t.getId());
        res.setTicketId(t.getTicketId());
        res.setSubject(t.getSubject());
        res.setDescription(t.getDescription());
        res.setCategory(t.getCategory());
        res.setPriority(t.getPriority());
        res.setStatus(t.getStatus());
        res.setDeviceInfo(t.getDeviceInfo());
        res.setBrowserInfo(t.getBrowserInfo());
        res.setAppVersion(t.getAppVersion());
        res.setUsername(t.getUser().getFullName());
        res.setUserEmail(t.getUser().getEmail());
        res.setAssignedAdminName(t.getAssignedAdmin() != null ? t.getAssignedAdmin().getFullName() : null);
        res.setAssignedAt(t.getAssignedAt());
        res.setRating(t.getRating());
        res.setFeedbackText(t.getFeedbackText());
        res.setCreatedAt(t.getCreatedAt());
        res.setUpdatedAt(t.getUpdatedAt());
        
        res.setResolvedAt(t.getResolvedAt());
        res.setResolvedByName(t.getResolvedBy() != null ? t.getResolvedBy().getFullName() : null);
        res.setResolutionMessage(t.getResolutionMessage());
        res.setTimeTakenMinutes(t.getTimeTakenMinutes());
        res.setIssueSummary(t.getIssueSummary());
        res.setRootCause(t.getRootCause());
        res.setResolutionAction(t.getResolutionAction());
        res.setResolutionResult(t.getResolutionResult());
        res.setProblemAnalysis(t.getProblemAnalysis());
        res.setResolutionSteps(t.getResolutionSteps());
        res.setChangesMade(t.getChangesMade());
        res.setVerificationPerformed(t.getVerificationPerformed());
        res.setFinalNotes(t.getFinalNotes());
        res.setAdditionalResources(t.getAdditionalResources());
        res.setResolutionAttachmentUrl(t.getResolutionAttachmentUrl());
        res.setResolutionAttachmentName(t.getResolutionAttachmentName());
        
        res.setAiConfidenceScore(t.getAiConfidenceScore());
        res.setAiEstimatedTime(t.getAiEstimatedTime());
        res.setAiHelpfulResources(t.getAiHelpfulResources());
        res.setAiSeverity(t.getAiSeverity());
        res.setAiPreventiveAdvice(t.getAiPreventiveAdvice());
        res.setAiGeneratedAt(t.getAiGeneratedAt());
        res.setIsAiResolved(t.getIsAiResolved());
        res.setAffectedModule(t.getAffectedModule());

        res.setMessages(msgs);
        res.setTimeline(timelineList);
        return res;
    }
}
