package com.carbontracker.repository;

import com.carbontracker.entity.OrganizationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrganizationUserRepository extends JpaRepository<OrganizationUser, Long> {
    List<OrganizationUser> findByUserId(Long userId);
    List<OrganizationUser> findByOrganizationId(Long organizationId);
    Optional<OrganizationUser> findByOrganizationIdAndUserId(Long organizationId, Long userId);
}
