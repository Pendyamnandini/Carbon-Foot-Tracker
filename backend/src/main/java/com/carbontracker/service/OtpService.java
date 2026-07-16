package com.carbontracker.service;

import com.carbontracker.entity.PasswordResetOtp;
import com.carbontracker.repository.PasswordResetOtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private final SecureRandom random = new SecureRandom();

    public void generateAndSendOtp(String email) {
        String rawOtp = String.format("%06d", random.nextInt(1000000));
        String hashedOtp = passwordEncoder.encode(rawOtp);

        PasswordResetOtp resetOtp = PasswordResetOtp.builder()
                .email(email)
                .otp(hashedOtp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .attempts(0)
                .verified(false)
                .build();

        otpRepository.save(resetOtp);
        emailService.sendOtpEmail(email, rawOtp);
    }

    public boolean verifyOtp(String email, String rawOtp) {
        Optional<PasswordResetOtp> otpOpt = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        if (otpOpt.isEmpty()) {
            throw new IllegalArgumentException("No OTP requested for this email");
        }

        PasswordResetOtp otpRecord = otpOpt.get();

        if (otpRecord.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        if (otpRecord.getAttempts() >= 3) {
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        otpRecord.setAttempts(otpRecord.getAttempts() + 1);
        boolean match = passwordEncoder.matches(rawOtp, otpRecord.getOtp());

        if (match) {
            otpRecord.setVerified(true);
            otpRepository.save(otpRecord);
            return true;
        } else {
            otpRepository.save(otpRecord);
            return false;
        }
    }

    public void invalidateOtp(String email) {
        otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .ifPresent(otpRecord -> otpRepository.delete(otpRecord));
    }
}
