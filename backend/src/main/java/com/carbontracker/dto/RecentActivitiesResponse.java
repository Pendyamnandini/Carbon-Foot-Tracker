package com.carbontracker.dto;

import com.carbontracker.entity.UserActivityHistory;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentActivitiesResponse {
    private LocalDateTime lastLoginTime;
    private LocalDateTime lastActiveTime;
    private List<UserActivityHistory> last10Activities;
    private String lastSearchedAnalytics;
    private String lastDownloadedReport;
    private String lastViewedRecommendation;
}
