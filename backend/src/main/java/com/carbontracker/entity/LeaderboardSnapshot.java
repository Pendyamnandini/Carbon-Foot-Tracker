package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leaderboard_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "rank_position", nullable = false)
    private int rankPosition;

    @Column(nullable = false)
    private double score;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;
}
