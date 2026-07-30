package com.carbontracker.repository;

import com.carbontracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE COALESCE(u.rewardPoints, 0) > :points")
    long countByRewardPointsGreaterThan(int points);
}
