package com.carbontracker.repository;

import com.carbontracker.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByUserId(Long userId);
    void deleteByUserId(Long userId);
    java.util.Optional<Recommendation> findByUserIdAndTitleAndCategory(Long userId, String title, String category);
    List<Recommendation> findByUserIdAndStatus(Long userId, String status);
}
