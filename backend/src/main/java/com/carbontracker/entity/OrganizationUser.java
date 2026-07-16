package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "organization_users", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // ORG_ADMIN or ORG_USER
}
