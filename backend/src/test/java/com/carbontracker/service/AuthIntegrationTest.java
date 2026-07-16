package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@Transactional
public class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @MockBean
    private EmailService emailService;

    @Test
    public void testFullAuthenticationAndResetFlow() {
        String email = "integration@example.com";
        String oldPassword = "OldPassword@123";
        String newPassword = "NewPassword@123";

        // 1. Register user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFullName("Integration User");
        registerRequest.setEmail(email);
        registerRequest.setPassword(oldPassword);
        registerRequest.setConfirmPassword(oldPassword);
        registerRequest.setMobileNumber("+19999999");

        User registeredUser = authService.register(registerRequest);
        assertNotNull(registeredUser);
        assertEquals(email, registeredUser.getEmail());

        // 2. Login with correct password
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(oldPassword);
        LoginResponse loginResponse = authService.login(loginRequest);
        assertNotNull(loginResponse);
        assertEquals(email, loginResponse.getEmail());
        assertNotNull(loginResponse.getAccessToken());

        // 3. Request Forgot Password
        authService.forgotPassword(email);

        // 4. Capture the generated raw OTP from EmailService
        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService, times(1)).sendOtpEmail(eq(email), otpCaptor.capture());
        String rawOtp = otpCaptor.getValue();
        assertNotNull(rawOtp);
        assertEquals(6, rawOtp.length());

        // 5. Verify the OTP is stored hashed in DB
        Optional<PasswordResetOtp> otpOpt = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        assertTrue(otpOpt.isPresent());
        assertNotEquals(rawOtp, otpOpt.get().getOtp()); // Hashed, not plain text

        // 6. Verify OTP endpoint (this marks OTP as verified in the DB)
        authService.verifyOtp(email, rawOtp);
        assertTrue(otpRepository.findTopByEmailOrderByCreatedAtDesc(email).get().isVerified());

        // 7. Reset Password
        ResetPasswordRequest resetRequest = new ResetPasswordRequest();
        resetRequest.setEmail(email);
        resetRequest.setOtp(rawOtp);
        resetRequest.setNewPassword(newPassword);
        resetRequest.setConfirmPassword(newPassword);
        authService.resetPassword(resetRequest);

        // 8. Verify OTP has been invalidated (deleted)
        Optional<PasswordResetOtp> otpAfterReset = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        assertTrue(otpAfterReset.isEmpty());

        // 9. Login with new password should succeed
        LoginRequest newLoginRequest = new LoginRequest();
        newLoginRequest.setEmail(email);
        newLoginRequest.setPassword(newPassword);
        LoginResponse newLoginResponse = authService.login(newLoginRequest);
        assertNotNull(newLoginResponse);
        assertEquals(email, newLoginResponse.getEmail());

        // 10. Login with old password should fail
        LoginRequest oldLoginRequest = new LoginRequest();
        oldLoginRequest.setEmail(email);
        oldLoginRequest.setPassword(oldPassword);
        assertThrows(Exception.class, () -> authService.login(oldLoginRequest));
    }
}
