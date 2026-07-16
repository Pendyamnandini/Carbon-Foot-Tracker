package com.carbontracker.repository;

import com.carbontracker.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdOrderByLogDateDesc(Long userId);
    List<ActivityLog> findByUserIdAndLogDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
