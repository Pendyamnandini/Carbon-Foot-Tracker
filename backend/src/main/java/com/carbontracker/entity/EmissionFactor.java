package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "emission_factors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(name = "activity_type", nullable = false)
    private String activityType;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private double factor;

    private String source;

    @Builder.Default
    private String version = "1.0";

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
