package com.carbontracker.repository;

import com.carbontracker.entity.UserCarbonSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserCarbonSummaryRepository extends JpaRepository<UserCarbonSummary, Long> {
    Optional<UserCarbonSummary> findByUserIdAndWeekNumberAndMonthAndYear(Long userId, int weekNumber, int month, int year);
    List<UserCarbonSummary> findByUserIdAndYearOrderByMonthAscWeekNumberAsc(Long userId, int year);
}
