package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.User;
import com.carbontracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/organization/auth")
public class OrganizationAuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.carbontracker.service.AuditLogService auditLogService;

    @Autowired
    private com.carbontracker.repository.UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        
        if (user == null || (!"ORG_ADMIN".equals(user.getRole()) && !"ORG_USER".equals(user.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: You do not have organization credentials."));
        }
        
        auditLogService.logActivity(user, "LOGIN", "Organization Login", "User logged into Organization Control Panel", "Organization Login Page", null, null);
        return ResponseEntity.ok(ApiResponse.success("Organization Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email != null && !email.equals("anonymousUser")) {
            authService.logout(email);
            userRepository.findByEmail(email).ifPresent(user -> {
                auditLogService.logActivity(user, "LOGOUT", "Organization Logout", "User logged out of Organization Control Panel", "Header Menu", null, null);
            });
        }
        return ResponseEntity.ok(ApiResponse.success("Organization Logged out successfully", null));
    }
}
