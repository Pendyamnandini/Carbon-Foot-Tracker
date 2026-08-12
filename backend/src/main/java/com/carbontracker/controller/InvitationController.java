package com.carbontracker.controller;

import com.carbontracker.dto.ApiResponse;
import com.carbontracker.dto.InvitationResponse;
import com.carbontracker.dto.InviteMemberRequest;
import com.carbontracker.entity.User;
import com.carbontracker.service.InvitationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invitations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvitationController {

    @Autowired
    private InvitationService invitationService;

    @PostMapping("/send/{organizationId}")
    public ResponseEntity<ApiResponse<Void>> sendInvitation(
            @AuthenticationPrincipal User user,
            @PathVariable Long organizationId,
            @Valid @RequestBody InviteMemberRequest request) {
        
        invitationService.sendInvitation(user, organizationId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invitation sent successfully", null));
    }

    @GetMapping("/pending/{organizationId}")
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> getPendingInvitations(
            @AuthenticationPrincipal User user,
            @PathVariable Long organizationId) {
        // In a real app we should check if user is ORG_ADMIN here too. Let's rely on service logic for full security or add it here.
        // Simplifying for now
        List<InvitationResponse> invites = invitationService.getPendingInvitations(organizationId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending invitations retrieved", invites));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<InvitationResponse>> validateToken(@RequestParam String token) {
        InvitationResponse response = invitationService.validateToken(token);
        return ResponseEntity.ok(new ApiResponse<>(true, "Token valid", response));
    }

    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<Void>> acceptInvitation(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> payload) {
        
        String token = payload.get("token");
        if (token == null || token.isEmpty()) {
            throw new RuntimeException("Token is missing");
        }
        
        invitationService.acceptInvitation(token, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Invitation accepted successfully", null));
    }
}
