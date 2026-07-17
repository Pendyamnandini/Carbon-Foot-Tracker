package com.carbontracker.repository;

import com.carbontracker.entity.MonthlyCarbonSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyCarbonSummaryRepository extends JpaRepository<MonthlyCarbonSummary, Long> {
    Optional<MonthlyCarbonSummary> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
    List<MonthlyCarbonSummary> findByUserIdOrderByYearDescMonthDesc(Long userId);
}
