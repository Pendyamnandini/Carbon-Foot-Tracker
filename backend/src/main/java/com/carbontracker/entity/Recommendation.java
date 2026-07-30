package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private String category;

    @Column(name = "generated_at", nullable = false)
    private LocalDate generatedAt;

    @Column(nullable = false)
    @Builder.Default
    private String status = "IN_PROGRESS";

    @Column(name = "remind_at")
    private java.time.LocalDateTime remindAt;
}
