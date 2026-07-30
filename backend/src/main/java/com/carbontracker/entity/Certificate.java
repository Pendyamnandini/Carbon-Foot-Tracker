package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "certificate_id", nullable = false, unique = true)
    private String certificateId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "date_issued", nullable = false)
    private LocalDate dateIssued;

    @Column(name = "verification_code", nullable = false, unique = true)
    private String verificationCode;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "digital_signature", nullable = false)
    private String digitalSignature;

    @Column(name = "platform_logo", nullable = false)
    private String platformLogo;
}
