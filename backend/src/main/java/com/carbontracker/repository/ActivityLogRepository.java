package com.carbontracker.repository;

import com.carbontracker.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdOrderByLogDateDesc(Long userId);
    List<ActivityLog> findByUserIdAndLogDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(l.logDate AS string) as groupKey, l.category as category, SUM(l.carbonEmission) as totalEmission " +
           "FROM ActivityLog l WHERE l.user.id = :userId " +
           "GROUP BY l.logDate, l.category ORDER BY l.logDate ASC")
    List<com.carbontracker.dto.CarbonAggregationProjection> findDailyFootprintTotals(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT 'ALL' as groupKey, l.category as category, SUM(l.carbonEmission) as totalEmission " +
           "FROM ActivityLog l WHERE l.user.id = :userId " +
           "GROUP BY l.category")
    List<com.carbontracker.dto.CarbonAggregationProjection> findCategoryTotals(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(l.logDate AS string) as groupKey, l.category as category, SUM(l.carbonEmission) as totalEmission " +
           "FROM ActivityLog l WHERE l.user.id = :userId AND l.logDate BETWEEN :startDate AND :endDate " +
           "GROUP BY l.logDate, l.category")
    List<com.carbontracker.dto.CarbonAggregationProjection> findAggregatesByDateRange(Long userId, LocalDate startDate, LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUBSTRING(CAST(l.logDate AS string), 1, 7) as groupKey, l.category as category, SUM(l.carbonEmission) as totalEmission " +
           "FROM ActivityLog l WHERE l.user.id = :userId " +
           "GROUP BY SUBSTRING(CAST(l.logDate AS string), 1, 7), l.category")
    List<com.carbontracker.dto.CarbonAggregationProjection> findMonthlyTotals(Long userId);
}
