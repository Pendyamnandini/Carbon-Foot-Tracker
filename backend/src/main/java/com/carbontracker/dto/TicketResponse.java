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
    private Integer rating;
    private String feedbackText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
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
        res.setRating(t.getRating());
        res.setFeedbackText(t.getFeedbackText());
        res.setCreatedAt(t.getCreatedAt());
        res.setUpdatedAt(t.getUpdatedAt());
        res.setMessages(msgs);
        res.setTimeline(timelineList);
        return res;
    }
}
