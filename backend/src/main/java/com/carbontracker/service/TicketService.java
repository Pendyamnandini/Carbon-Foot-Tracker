package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketMessageRepository ticketMessageRepository;

    @Autowired
    private TicketTimelineRepository ticketTimelineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    private final String uploadDir = "uploads";

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest req, User user) {
        // Generate unique Ticket ID
        String ticketId = generateUniqueTicketId();

        Ticket ticket = Ticket.builder()
                .ticketId(ticketId)
                .user(user)
                .subject(req.getSubject())
                .description(req.getDescription())
                .category(req.getCategory())
                .priority(req.getPriority())
                .status("Open")
                .deviceInfo(req.getDeviceInfo())
                .browserInfo(req.getBrowserInfo())
                .appVersion(req.getAppVersion())
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);

        // Save attachment if present
        String attachmentUrl = null;
        if (req.getAttachmentBase64() != null && !req.getAttachmentBase64().isEmpty()) {
            attachmentUrl = saveBase64File(req.getAttachmentBase64(), req.getAttachmentName());
            if (attachmentUrl != null) {
                TicketMessage attachmentMsg = TicketMessage.builder()
                        .ticket(savedTicket)
                        .sender(user)
                        .messageText("Uploaded file: " + req.getAttachmentName())
                        .attachmentUrl(attachmentUrl)
                        .attachmentName(req.getAttachmentName())
                        .build();
                ticketMessageRepository.save(attachmentMsg);
            }
        }

        // Add timeline event
        createTimelineEvent(savedTicket, "Ticket Created", "Open", "Ticket was raised by the user.");

        // Audit Log
        auditLogService.log(user, "CREATE", "Support Ticket", savedTicket.getId(), "Raised ticket: " + ticketId);

        // Email Alert
        try {
            emailService.sendNotificationEmail(user.getEmail(), "Support Ticket Raised", 
                "Your ticket " + ticketId + " has been successfully created with status: Open.");
        } catch (Exception e) {
            System.err.println("Email notice failed: " + e.getMessage());
        }

        return getTicketDetails(ticketId, user);
    }

    public List<TicketResponse> getUserTickets(User user) {
        List<Ticket> tickets = ticketRepository.findByUser(user);
        return tickets.stream()
                .map(t -> TicketResponse.from(t, Collections.emptyList(), Collections.emptyList()))
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        // Sort Critical first
        tickets.sort((a, b) -> {
            if ("Critical".equalsIgnoreCase(a.getPriority()) && !"Critical".equalsIgnoreCase(b.getPriority())) return -1;
            if (!"Critical".equalsIgnoreCase(a.getPriority()) && "Critical".equalsIgnoreCase(b.getPriority())) return 1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return tickets.stream()
                .map(t -> TicketResponse.from(t, Collections.emptyList(), Collections.emptyList()))
                .collect(Collectors.toList());
    }

    public TicketResponse getTicketDetails(String ticketId, User user) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        // Check auth: User can only see their own tickets, ADMIN can see all
        if (!user.getRole().equals(Role.ADMIN) && !ticket.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied to support ticket.");
        }

        List<TicketMessage> messages = ticketMessageRepository.findByTicketOrderByCreatedAtAsc(ticket);
        List<TicketTimeline> timeline = ticketTimelineRepository.findByTicketOrderByCreatedAtAsc(ticket);

        return TicketResponse.from(ticket, messages, timeline);
    }

    @Transactional
    public TicketResponse addMessage(String ticketId, TicketMessageRequest req, User sender) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (!sender.getRole().equals(Role.ADMIN) && !ticket.getUser().getId().equals(sender.getId())) {
            throw new IllegalStateException("Access denied");
        }

        String attachmentUrl = null;
        if (req.getAttachmentBase64() != null && !req.getAttachmentBase64().isEmpty()) {
            attachmentUrl = saveBase64File(req.getAttachmentBase64(), req.getAttachmentName());
        }

        TicketMessage msg = TicketMessage.builder()
                .ticket(ticket)
                .sender(sender)
                .messageText(req.getMessageText() != null ? req.getMessageText() : "")
                .attachmentUrl(attachmentUrl)
                .attachmentName(req.getAttachmentName())
                .build();

        ticketMessageRepository.save(msg);

        // Update ticket updated timestamp
        ticket.setUpdatedAt(LocalDateTime.now());
        
        // If user replies and ticket was Assigned, change status to In Progress
        if (!sender.getRole().equals(Role.ADMIN) && "Assigned".equalsIgnoreCase(ticket.getStatus())) {
            ticket.setStatus("In Progress");
            createTimelineEvent(ticket, "User Replied", "In Progress", "User sent a response. Status automatically changed to In Progress.");
        }

        ticketRepository.save(ticket);

        // Send notifications
        if (sender.getRole().equals(Role.ADMIN)) {
            // Admin replied -> Notify User
            notificationService.createNotification(ticket.getUser(), "Admin Replied to Ticket", 
                "An administrator has replied to ticket " + ticket.getTicketId() + ": \"" + req.getMessageText() + "\"", NotificationType.INFO);
        } else {
            // User replied -> Notify Admin if assigned
            if (ticket.getAssignedAdmin() != null) {
                notificationService.createNotification(ticket.getAssignedAdmin(), "User Replied to Ticket", 
                    "User " + sender.getFullName() + " replied to ticket " + ticket.getTicketId(), NotificationType.INFO);
            }
        }

        return getTicketDetails(ticketId, sender);
    }

    @Transactional
    public TicketResponse updateTicket(String ticketId, TicketUpdateRequest req, User admin) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (req.getStatus() != null && !req.getStatus().equalsIgnoreCase(ticket.getStatus())) {
            String oldStatus = ticket.getStatus();
            ticket.setStatus(req.getStatus());
            createTimelineEvent(ticket, "Status Updated", req.getStatus(), 
                "Admin updated ticket status from " + oldStatus + " to " + req.getStatus() + ".");
            
            // Notify User
            notificationService.createNotification(ticket.getUser(), "Ticket Status Updated", 
                "Your ticket " + ticket.getTicketId() + " status is now " + req.getStatus(), NotificationType.INFO);
        }

        if (req.getPriority() != null && !req.getPriority().equalsIgnoreCase(ticket.getPriority())) {
            String oldPriority = ticket.getPriority();
            ticket.setPriority(req.getPriority());
            createTimelineEvent(ticket, "Priority Changed", ticket.getStatus(), 
                "Admin changed priority from " + oldPriority + " to " + req.getPriority() + ".");
        }

        if (req.getAssignedAdminId() != null) {
            User targetAdmin = userRepository.findById(req.getAssignedAdminId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
            
            ticket.setAssignedAdmin(targetAdmin);
            ticket.setStatus("Assigned");
            createTimelineEvent(ticket, "Ticket Assigned", "Assigned", 
                "Ticket was assigned to support administrator: " + targetAdmin.getFullName());
            
            // Notify Assigned Admin
            notificationService.createNotification(targetAdmin, "Support Ticket Assigned", 
                "You have been assigned to support ticket " + ticket.getTicketId(), NotificationType.INFO);
            
            // Notify User
            notificationService.createNotification(ticket.getUser(), "Support Engineer Assigned", 
                "Your ticket " + ticket.getTicketId() + " has been assigned to support administrator: " + targetAdmin.getFullName(), NotificationType.INFO);
        }

        ticketRepository.save(ticket);
        auditLogService.log(admin, "UPDATE", "Support Ticket", ticket.getId(), "Updated status/priority for ticket: " + ticketId);

        return getTicketDetails(ticketId, admin);
    }

    @Transactional
    public TicketResponse resolveTicket(String ticketId, User admin) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        ticket.setStatus("Resolved");
        createTimelineEvent(ticket, "Ticket Resolved", "Resolved", "Support administrator marked the issue as resolved.");
        ticketRepository.save(ticket);

        // Notify User
        notificationService.createNotification(ticket.getUser(), "Ticket Resolved Successfully", 
            "Support has marked your ticket " + ticket.getTicketId() + " as Resolved. Please provide feedback.", NotificationType.SUCCESS);

        // Trigger Direct Nodemailer HTML updates simulation (Mock Email dispatch)
        try {
            emailService.sendNotificationEmail(ticket.getUser().getEmail(), "Support Issue Resolved - " + ticket.getTicketId(),
                "Dear " + ticket.getUser().getFullName() + ",\n\nWe have successfully resolved your support concern regarding: \"" + ticket.getSubject() + "\".\n\nPlease log back in and rate your support experience.\n\nRegards,\nCarbon Tracker Support");
        } catch (Exception e) {
            System.err.println("SMTP Notice failed: " + e.getMessage());
        }

        return getTicketDetails(ticketId, admin);
    }

    @Transactional
    public TicketResponse addFeedback(String ticketId, TicketFeedbackRequest req, User user) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Only the ticket creator can add feedback.");
        }

        ticket.setRating(req.getRating());
        ticket.setFeedbackText(req.getFeedbackText());
        ticket.setStatus("Closed");
        createTimelineEvent(ticket, "Feedback Submitted", "Closed", "User completed support feedback. Ticket closed.");
        ticketRepository.save(ticket);

        return getTicketDetails(ticketId, user);
    }

    @Transactional
    public void mergeTickets(String primaryId, String duplicateId, User admin) {
        Ticket primary = ticketRepository.findByTicketId(primaryId)
                .orElseThrow(() -> new IllegalArgumentException("Primary ticket not found: " + primaryId));
        Ticket duplicate = ticketRepository.findByTicketId(duplicateId)
                .orElseThrow(() -> new IllegalArgumentException("Duplicate ticket not found: " + duplicateId));

        duplicate.setStatus("Closed");
        createTimelineEvent(duplicate, "Merged", "Closed", "Ticket merged as duplicate into ticket: " + primaryId);
        ticketRepository.save(duplicate);

        // Add note in primary
        TicketMessage mergeMsg = TicketMessage.builder()
                .ticket(primary)
                .sender(admin)
                .messageText("Merged duplicate ticket " + duplicateId + " into this thread. Duplicate issue description: \"" + duplicate.getDescription() + "\"")
                .build();
        ticketMessageRepository.save(mergeMsg);

        createTimelineEvent(primary, "Ticket Merged", primary.getStatus(), "Duplicate ticket " + duplicateId + " was merged into this thread.");
    }

    @Transactional
    public void deleteTicket(String ticketId, User admin) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        ticketRepository.delete(ticket);
        auditLogService.log(admin, "DELETE", "Support Ticket", null, "Deleted spam ticket: " + ticketId);
    }

    public Map<String, Object> getAnalytics() {
        List<Ticket> tickets = ticketRepository.findAll();
        Map<String, Object> map = new HashMap<>();

        long total = tickets.size();
        long open = tickets.stream().filter(t -> "Open".equalsIgnoreCase(t.getStatus())).count();
        long assigned = tickets.stream().filter(t -> "Assigned".equalsIgnoreCase(t.getStatus())).count();
        long inProgress = tickets.stream().filter(t -> "In Progress".equalsIgnoreCase(t.getStatus())).count();
        long resolved = tickets.stream().filter(t -> "Resolved".equalsIgnoreCase(t.getStatus())).count();
        long closed = tickets.stream().filter(t -> "Closed".equalsIgnoreCase(t.getStatus())).count();
        long critical = tickets.stream().filter(t -> "Critical".equalsIgnoreCase(t.getPriority())).count();

        // Categorized distribution
        Map<String, Long> categoryCounts = tickets.stream()
                .collect(Collectors.groupingBy(Ticket::getCategory, Collectors.counting()));

        // Priority distribution
        Map<String, Long> priorityCounts = tickets.stream()
                .collect(Collectors.groupingBy(Ticket::getPriority, Collectors.counting()));

        // Satisfaction rating
        double avgSatisfaction = tickets.stream()
                .filter(t -> t.getRating() != null && t.getRating() > 0)
                .mapToInt(Ticket::getRating)
                .average()
                .orElse(5.0);

        map.put("total", total);
        map.put("open", open);
        map.put("assigned", assigned);
        map.put("inProgress", inProgress);
        map.put("resolved", resolved);
        map.put("closed", closed);
        map.put("critical", critical);
        map.put("categories", categoryCounts);
        map.put("priorities", priorityCounts);
        map.put("satisfaction", Math.round(avgSatisfaction * 10.0) / 10.0);

        return map;
    }

    private String generateUniqueTicketId() {
        int year = LocalDate.now().getYear();
        Random r = new Random();
        while (true) {
            String ticketId = "SUP-" + year + "-" + String.format("%05d", r.nextInt(100000));
            if (!ticketRepository.findByTicketId(ticketId).isPresent()) {
                return ticketId;
            }
        }
    }

    private String saveBase64File(String base64, String filename) {
        if (base64 == null || base64.isEmpty()) return null;
        try {
            // Ensure directory exists
            Files.createDirectories(Paths.get(uploadDir));

            byte[] bytes = Base64.getDecoder().decode(base64);
            String extension = "";
            if (filename != null && filename.contains(".")) {
                extension = filename.substring(filename.lastIndexOf("."));
            }
            String storedName = UUID.randomUUID().toString() + extension;
            Path targetPath = Paths.get(uploadDir).resolve(storedName);
            Files.write(targetPath, bytes);
            return "/api/files/" + storedName;
        } catch (IOException e) {
            System.err.println("Failed to write base64 file: " + e.getMessage());
            return null;
        }
    }

    private void createTimelineEvent(Ticket ticket, String eventType, String status, String message) {
        TicketTimeline timeline = TicketTimeline.builder()
                .ticket(ticket)
                .eventType(eventType)
                .status(status)
                .message(message)
                .build();
        ticketTimelineRepository.save(timeline);
    }
}
