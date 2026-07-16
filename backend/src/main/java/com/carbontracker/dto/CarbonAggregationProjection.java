package com.carbontracker.dto;

import com.carbontracker.entity.Category;

public interface CarbonAggregationProjection {
    String getGroupKey();
    Category getCategory();
    Double getTotalEmission();
}
