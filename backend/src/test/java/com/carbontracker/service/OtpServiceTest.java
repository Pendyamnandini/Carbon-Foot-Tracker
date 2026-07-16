package com.carbontracker.service;

import com.carbontracker.entity.PasswordResetOtp;
import com.carbontracker.repository.PasswordResetOtpRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OtpServiceTest {

    @InjectMocks
    private OtpService otpService;

    @Mock
    private PasswordResetOtpRepository otpRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testVerifyOtp_Success() {
        String email = "user@example.com";
        String rawOtp = "123456";
        String hashedOtp = "$2a$10$hashedotp";

        PasswordResetOtp otpRecord = PasswordResetOtp.builder()
                .email(email)
                .otp(hashedOtp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .attempts(0)
                .verified(false)
                .build();

        when(otpRepository.findTopByEmailOrderByCreatedAtDesc(email)).thenReturn(Optional.of(otpRecord));
        when(passwordEncoder.matches(rawOtp, hashedOtp)).thenReturn(true);

        boolean result = otpService.verifyOtp(email, rawOtp);

        assertTrue(result);
        assertTrue(otpRecord.isVerified());
        assertEquals(1, otpRecord.getAttempts());
        verify(otpRepository, times(1)).save(otpRecord);
    }

    @Test
    void testVerifyOtp_Expired() {
        String email = "user@example.com";
        String rawOtp = "123456";

        PasswordResetOtp otpRecord = PasswordResetOtp.builder()
                .email(email)
                .otp("hashed")
                .expiryTime(LocalDateTime.now().minusMinutes(1)) // Expired
                .attempts(0)
                .verified(false)
                .build();

        when(otpRepository.findTopByEmailOrderByCreatedAtDesc(email)).thenReturn(Optional.of(otpRecord));

        assertThrows(IllegalArgumentException.class, () -> otpService.verifyOtp(email, rawOtp));
    }

    @Test
    void testVerifyOtp_MaxAttemptsExceeded() {
        String email = "user@example.com";
        String rawOtp = "123456";

        PasswordResetOtp otpRecord = PasswordResetOtp.builder()
                .email(email)
                .otp("hashed")
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .attempts(3) // 3 attempts already made
                .verified(false)
                .build();

        when(otpRepository.findTopByEmailOrderByCreatedAtDesc(email)).thenReturn(Optional.of(otpRecord));

        assertThrows(IllegalArgumentException.class, () -> otpService.verifyOtp(email, rawOtp));
    }
}
