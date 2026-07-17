package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.User;
import com.carbontracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.carbontracker.service.AuditLogService auditLogService;

    @Autowired
    private com.carbontracker.repository.UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User registeredUser = authService.register(request);
        auditLogService.logActivity(registeredUser, "CREATE", "Profile Creation", "User account registered", "Register Page", null, null);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", registeredUser));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            auditLogService.logActivity(user, "LOGIN", "User Login", "User logged in successfully", "Login Page", null, null);
        });
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> googleLogin(@RequestBody String idToken) {
        LoginResponse response = authService.googleLogin(idToken);
        if (response != null && response.getEmail() != null) {
            userRepository.findByEmail(response.getEmail()).ifPresent(user -> {
                auditLogService.logActivity(user, "LOGIN", "Google Sign-In", "Logged in via Google", "Login Page", null, null);
            });
        }
        return ResponseEntity.ok(ApiResponse.success("Google Sign-In successful", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            auditLogService.logActivity(user, "CREATE", "Password Reset Request", "Requested password reset OTP", "Forgot Password Page", null, null);
        });
        return ResponseEntity.ok(ApiResponse.success("OTP has been sent to your email", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            auditLogService.logActivity(user, "UPDATE", "Password Reset Success", "Reset password via OTP verify", "Reset Password Page", null, null);
        });
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email != null && !email.equals("anonymousUser")) {
            authService.logout(email);
            userRepository.findByEmail(email).ifPresent(user -> {
                auditLogService.logActivity(user, "LOGOUT", "User Logout", "User logged out", "Header Menu", null, null);
            });
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
