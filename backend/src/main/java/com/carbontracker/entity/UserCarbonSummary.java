package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_carbon_summary")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCarbonSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "week_number", nullable = false)
    private int weekNumber;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    @Builder.Default
    @Column(name = "transport_total")
    private double transportTotal = 0.0;

    @Builder.Default
    @Column(name = "electricity_total")
    private double electricityTotal = 0.0;

    @Builder.Default
    @Column(name = "food_total")
    private double foodTotal = 0.0;

    @Builder.Default
    @Column(name = "shopping_total")
    private double shoppingTotal = 0.0;

    @Builder.Default
    @Column(name = "overall_total")
    private double overallTotal = 0.0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
