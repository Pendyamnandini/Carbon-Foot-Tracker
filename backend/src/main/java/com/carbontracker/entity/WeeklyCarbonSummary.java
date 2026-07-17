package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_carbon_summary", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "week_number", "year"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyCarbonSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "transport_total")
    private Double transportTotal;

    @Column(name = "electricity_total")
    private Double electricityTotal;

    @Column(name = "food_total")
    private Double foodTotal;

    @Column(name = "shopping_total")
    private Double shoppingTotal;

    @Column(name = "overall_total")
    private Double overallTotal;

    @Column(name = "activity_count")
    private Integer activityCount;

    @Column(name = "sustainability_score")
    private Double sustainabilityScore;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
