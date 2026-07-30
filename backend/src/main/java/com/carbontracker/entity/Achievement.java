package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "achievements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "reward_points", nullable = false)
    private Integer rewardPoints;

    @Column(name = "badge_name")
    private String badgeName;

    @Column(name = "certificate_eligible")
    private boolean certificateEligible;

    @CreationTimestamp
    @Column(name = "achieved_at", updatable = false)
    private LocalDateTime achievedAt;
}
