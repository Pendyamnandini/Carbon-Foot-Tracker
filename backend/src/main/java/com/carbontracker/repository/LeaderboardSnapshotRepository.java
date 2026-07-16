package com.carbontracker.repository;

import com.carbontracker.entity.LeaderboardSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaderboardSnapshotRepository extends JpaRepository<LeaderboardSnapshot, Long> {
    List<LeaderboardSnapshot> findByMonthAndYearOrderByRankPositionAsc(int month, int year);
}
