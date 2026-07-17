package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_carbon_summary", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "summary_date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyCarbonSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "summary_date", nullable = false)
    private LocalDate summaryDate;

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
