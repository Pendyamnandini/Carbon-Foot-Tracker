package com.carbontracker.repository;

import com.carbontracker.entity.UserActivityHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityHistoryRepository extends JpaRepository<UserActivityHistory, Long> {
    
    Page<UserActivityHistory> findByUserId(Long userId, Pageable pageable);
    
    Page<UserActivityHistory> findByUserIdAndActivityType(Long userId, String activityType, Pageable pageable);
    
    Page<UserActivityHistory> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime timestamp, Pageable pageable);
    
    List<UserActivityHistory> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<UserActivityHistory> findFirstByUserIdAndActivityTypeOrderByCreatedAtDesc(Long userId, String activityType);

    List<UserActivityHistory> findByActivityTypeAndCreatedAtAfter(String activityType, LocalDateTime timestamp);

    @Query("SELECT u FROM UserActivityHistory u WHERE u.activityType = 'LOGIN' ORDER BY u.createdAt DESC")
    Page<UserActivityHistory> findAllLogins(Pageable pageable);

    @Query("SELECT u.user.fullName, COUNT(u.id) FROM UserActivityHistory u GROUP BY u.user.fullName ORDER BY COUNT(u.id) DESC")
    List<Object[]> findMostActiveUsersLimit(Pageable pageable);

    @Query("SELECT u.pageName, COUNT(u.id) FROM UserActivityHistory u WHERE u.pageName IS NOT NULL GROUP BY u.pageName ORDER BY COUNT(u.id) DESC")
    List<Object[]> findMostVisitedPagesLimit(Pageable pageable);

    @Query("SELECT u.activityDescription, COUNT(u.id) FROM UserActivityHistory u WHERE u.activityType = 'DOWNLOAD' GROUP BY u.activityDescription ORDER BY COUNT(u.id) DESC")
    List<Object[]> findMostDownloadedReportsLimit(Pageable pageable);
}
