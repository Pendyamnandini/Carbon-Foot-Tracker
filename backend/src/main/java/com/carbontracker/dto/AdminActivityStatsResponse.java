package com.carbontracker.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminActivityStatsResponse {
    private List<StatItem> mostActiveUsers;
    private List<StatItem> mostVisitedPages;
    private List<StatItem> mostDownloadedReports;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatItem {
        private String label;
        private Long count;
    }
}
