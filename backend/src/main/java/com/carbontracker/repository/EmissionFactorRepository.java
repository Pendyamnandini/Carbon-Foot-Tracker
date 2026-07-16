package com.carbontracker.repository;

import com.carbontracker.entity.Category;
import com.carbontracker.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findByCategoryAndActivityTypeAndActiveTrue(Category category, String activityType);
    List<EmissionFactor> findByActiveTrue();
}
