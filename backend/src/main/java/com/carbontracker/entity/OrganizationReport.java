package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "organization_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "report_month", nullable = false)
    private int reportMonth;

    @Column(name = "report_year", nullable = false)
    private int reportYear;

    @Column(name = "total_emission", nullable = false)
    private double totalEmission;
}
