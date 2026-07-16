package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @CreationTimestamp
    @Column(name = "awarded_date", updatable = false)
    private LocalDateTime awardedDate;
}
