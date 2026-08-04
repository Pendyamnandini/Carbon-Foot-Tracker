package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false, unique = true)
    private String ticketId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String priority;

    @Column(nullable = false)
    private String status;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "browser_info")
    private String browserInfo;

    @Column(name = "app_version")
    private String appVersion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_admin_id")
    private User assignedAdmin;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Builder.Default
    private Integer rating = 0;

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resolved_by_id")
    private User resolvedBy;

    @Column(name = "resolution_message", columnDefinition = "TEXT")
    private String resolutionMessage;

    @Column(name = "time_taken_minutes")
    private Long timeTakenMinutes;

    @Column(name = "issue_summary", columnDefinition = "TEXT")
    private String issueSummary;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(name = "resolution_action", columnDefinition = "TEXT")
    private String resolutionAction;

    @Column(name = "resolution_result", columnDefinition = "TEXT")
    private String resolutionResult;

    @Column(name = "problem_analysis", columnDefinition = "TEXT")
    private String problemAnalysis;

    @Column(name = "resolution_steps", columnDefinition = "TEXT")
    private String resolutionSteps;

    @Column(name = "changes_made", columnDefinition = "TEXT")
    private String changesMade;

    @Column(name = "verification_performed", columnDefinition = "TEXT")
    private String verificationPerformed;

    @Column(name = "final_notes", columnDefinition = "TEXT")
    private String finalNotes;

    @Column(name = "additional_resources", columnDefinition = "TEXT")
    private String additionalResources;

    @Column(name = "resolution_attachment_url")
    private String resolutionAttachmentUrl;

    @Column(name = "resolution_attachment_name")
    private String resolutionAttachmentName;

    @Column(name = "ai_confidence_score")
    private Integer aiConfidenceScore;

    @Column(name = "ai_estimated_time")
    private String aiEstimatedTime;

    @Column(name = "ai_helpful_resources", columnDefinition = "TEXT")
    private String aiHelpfulResources;

    @Column(name = "ai_severity")
    private String aiSeverity;

    @Column(name = "ai_preventive_advice", columnDefinition = "TEXT")
    private String aiPreventiveAdvice;

    @Column(name = "ai_generated_at")
    private LocalDateTime aiGeneratedAt;

    @Column(name = "is_ai_resolved")
    private Boolean isAiResolved = false;

    @Column(name = "affected_module")
    private String affectedModule;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
