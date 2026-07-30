package com.carbontracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "badge_name", nullable = false)
    private String badgeName;

    private String description;

    @Column(nullable = false)
    private String criteria;

    private String category;

    @Column(name = "image_url")
    private String imageUrl;
}
