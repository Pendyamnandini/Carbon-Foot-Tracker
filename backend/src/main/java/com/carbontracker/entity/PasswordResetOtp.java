package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_otp")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otp;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @Builder.Default
    private boolean verified = false;

    @Builder.Default
    private int attempts = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
