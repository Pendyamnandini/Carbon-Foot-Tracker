package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.config.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // Default role
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Audit log
        auditLogService.log(savedUser, "REGISTRATION", "User", savedUser.getId(), "User registered successfully");

        return savedUser;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String accessToken = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        // Audit log
        auditLogService.log(user, "LOGIN", "User", user.getId(), "User logged in successfully");

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public LoginResponse googleLogin(String idToken) {
        // Ready architecture for OAuth2: decode, parse payload, find or register
        // For development, we mock-decode the idToken as email or read it if it contains email.
        String mockEmail = idToken; // assume idToken is a mock email for testing
        if (!mockEmail.contains("@")) {
            mockEmail = "google.user@carbontracker.com";
        }

        Optional<User> userOpt = userRepository.findByEmail(mockEmail);
        User user;
        if (userOpt.isEmpty()) {
            user = User.builder()
                    .fullName("Google User")
                    .email(mockEmail)
                    .password(passwordEncoder.encode("GoogleOAuth2SecureMockPassword123!"))
                    .role(Role.USER)
                    .active(true)
                    .build();
            user = userRepository.save(user);
            auditLogService.log(user, "REGISTRATION_OAUTH2", "User", user.getId(), "User registered via Google OAuth2");
        } else {
            user = userOpt.get();
        }

        String accessToken = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        auditLogService.log(user, "LOGIN_OAUTH2", "User", user.getId(), "User logged in via Google OAuth2");

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        otpService.generateAndSendOtp(email);
        auditLogService.log(user, "FORGOT_PASSWORD_REQUEST", "User", user.getId(), "OTP requested for password reset");
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean verified = otpService.verifyOtp(email, otp);
        if (!verified) {
            throw new IllegalArgumentException("Invalid OTP code");
        }

        auditLogService.log(user, "OTP_VERIFIED", "User", user.getId(), "OTP verification succeeded");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean verified = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!verified) {
            throw new IllegalArgumentException("OTP code could not be verified");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpService.invalidateOtp(request.getEmail());

        auditLogService.log(user, "PASSWORD_RESET", "User", user.getId(), "Password updated via OTP reset");
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        refreshTokenService.deleteByUserId(user.getId());
        auditLogService.log(user, "LOGOUT", "User", user.getId(), "User logged out, tokens revoked");
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
                    return TokenRefreshResponse.builder()
                            .accessToken(token)
                            .refreshToken(requestRefreshToken)
                            .build();
                })
                .orElseThrow(() -> new IllegalArgumentException("Refresh token is not in database!"));
    }
}
