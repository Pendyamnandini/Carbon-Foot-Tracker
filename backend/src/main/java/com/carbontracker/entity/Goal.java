package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "goal_title", nullable = false)
    private String goalTitle;

    @Column(name = "target_reduction_percentage", nullable = false)
    private double targetReductionPercentage;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Builder.Default
    @Column(name = "current_progress")
    private double currentProgress = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalStatus status;
}
