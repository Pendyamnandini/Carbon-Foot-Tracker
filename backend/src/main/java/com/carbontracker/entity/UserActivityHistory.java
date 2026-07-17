package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivityHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_type", nullable = false)
    private String activityType;

    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @Column(name = "activity_description")
    private String activityDescription;

    @Column(name = "page_name")
    private String pageName;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "device_info")
    private String deviceInfo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
