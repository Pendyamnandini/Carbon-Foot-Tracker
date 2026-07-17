package com.carbontracker.repository;

import com.carbontracker.entity.WeeklyCarbonSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyCarbonSummaryRepository extends JpaRepository<WeeklyCarbonSummary, Long> {
    Optional<WeeklyCarbonSummary> findByUserIdAndWeekNumberAndYear(Long userId, Integer weekNumber, Integer year);
    List<WeeklyCarbonSummary> findByUserIdOrderByYearDescWeekNumberDesc(Long userId);
}
