package com.carbontracker.repository;

import com.carbontracker.entity.OrganizationInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationInvitationRepository extends JpaRepository<OrganizationInvitation, Long> {
    Optional<OrganizationInvitation> findByToken(String token);
    List<OrganizationInvitation> findByOrganizationId(Long organizationId);
    List<OrganizationInvitation> findByOrganizationIdAndStatus(Long organizationId, String status);
    List<OrganizationInvitation> findByEmail(String email);
    Optional<OrganizationInvitation> findByOrganizationIdAndEmail(Long organizationId, String email);
}
