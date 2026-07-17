package com.carbontracker.repository;

import com.carbontracker.entity.DailyCarbonSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyCarbonSummaryRepository extends JpaRepository<DailyCarbonSummary, Long> {
    Optional<DailyCarbonSummary> findByUserIdAndSummaryDate(Long userId, LocalDate date);
    
    List<DailyCarbonSummary> findByUserIdAndSummaryDateBetweenOrderBySummaryDateAsc(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(d.overallTotal), 0.0) FROM DailyCarbonSummary d WHERE d.user.id = :userId AND d.summaryDate BETWEEN :start AND :end")
    Double sumEmissionsInPeriod(Long userId, LocalDate start, LocalDate end);
}
