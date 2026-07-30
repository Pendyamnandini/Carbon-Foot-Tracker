package com.carbontracker.repository;

import com.carbontracker.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByUserId(Long userId);
    List<Achievement> findByUserIdOrderByAchievedAtDesc(Long userId);
    Optional<Achievement> findByUserIdAndTitle(Long userId, String title);
}
