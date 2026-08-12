package com.carbontracker.service;

import com.carbontracker.dto.InvitationResponse;
import com.carbontracker.dto.InviteMemberRequest;
import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvitationService {

    @Autowired
    private OrganizationInvitationRepository invitationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public void sendInvitation(User inviter, Long organizationId, InviteMemberRequest request) {
        // Validate inviter's role
        OrganizationUser orgUser = organizationUserRepository.findByOrganizationIdAndUserId(organizationId, inviter.getId())
                .orElseThrow(() -> new RuntimeException("User does not belong to this organization"));
        
        if (orgUser.getRole() != Role.ORG_ADMIN && inviter.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized: Only ORG_ADMIN can invite members");
        }

        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Check if user is already a member
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            if (organizationUserRepository.findByOrganizationIdAndUserId(organizationId, existingUser.get().getId()).isPresent()) {
                throw new RuntimeException("User is already a member of this organization");
            }
        }

        // Check if there's already a pending invitation
        Optional<OrganizationInvitation> existingInvite = invitationRepository.findByOrganizationIdAndEmail(organizationId, request.getEmail());
        if (existingInvite.isPresent() && existingInvite.get().getStatus().equals("PENDING") && existingInvite.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("A valid invitation already exists for this email");
        }

        // Generate token and save
        String token = UUID.randomUUID().toString();
        OrganizationInvitation invitation = OrganizationInvitation.builder()
                .organization(organization)
                .email(request.getEmail())
                .invitedBy(inviter)
                .token(token)
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        invitationRepository.save(invitation);

        // Send email
        emailService.sendOrganizationInvitationEmail(
                request.getEmail(),
                organization.getOrganizationName(),
                inviter.getFullName(),
                token,
                invitation.getExpiresAt()
        );
    }

    public List<InvitationResponse> getPendingInvitations(Long organizationId) {
        return invitationRepository.findByOrganizationIdAndStatus(organizationId, "PENDING")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public InvitationResponse validateToken(String token) {
        OrganizationInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

        if (!invitation.getStatus().equals("PENDING") || invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invitation is invalid or has expired");
        }

        return mapToResponse(invitation);
    }

    @Transactional
    public void acceptInvitation(String token, User authenticatedUser) {
        OrganizationInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

        if (!invitation.getStatus().equals("PENDING") || invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invitation is invalid or has expired");
        }

        if (!invitation.getEmail().equalsIgnoreCase(authenticatedUser.getEmail())) {
            throw new RuntimeException("Authenticated user email does not match invitation email");
        }

        // Check if already a member
        Optional<OrganizationUser> existingMember = organizationUserRepository.findByOrganizationIdAndUserId(invitation.getOrganization().getId(), authenticatedUser.getId());
        if (existingMember.isPresent()) {
            invitation.setStatus("ACCEPTED");
            invitation.setAcceptedAt(LocalDateTime.now());
            invitationRepository.save(invitation);
            return;
        }

        // Add to organization
        OrganizationUser newUser = OrganizationUser.builder()
                .organization(invitation.getOrganization())
                .user(authenticatedUser)
                .role(Role.ORG_USER)
                .build();

        organizationUserRepository.save(newUser);

        // Update invitation status
        invitation.setStatus("ACCEPTED");
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    private InvitationResponse mapToResponse(OrganizationInvitation inv) {
        return InvitationResponse.builder()
                .id(inv.getId())
                .organizationName(inv.getOrganization().getOrganizationName())
                .email(inv.getEmail())
                .invitedByName(inv.getInvitedBy() != null ? inv.getInvitedBy().getFullName() : "System")
                .status(inv.getStatus())
                .expiresAt(inv.getExpiresAt())
                .createdAt(inv.getCreatedAt())
                .build();
    }
}
