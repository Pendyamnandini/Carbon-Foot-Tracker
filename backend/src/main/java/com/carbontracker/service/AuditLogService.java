package com.carbontracker.service;

import com.carbontracker.entity.AuditLog;
import com.carbontracker.entity.User;
import com.carbontracker.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired(required = false)
    private HttpServletRequest request;

    @Autowired
    private com.carbontracker.repository.UserActivityHistoryRepository userActivityHistoryRepository;

    public void log(User user, String actionType, String entityType, Long entityId, String description) {
        String ipAddress = "0.0.0.0";
        if (request != null) {
            try {
                String xfHeader = request.getHeader("X-Forwarded-For");
                if (xfHeader == null || xfHeader.isEmpty()) {
                    ipAddress = request.getRemoteAddr();
                } else {
                    ipAddress = xfHeader.split(",")[0];
                }
            } catch (Exception e) {
                // Ignore context errors
            }
        }
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(auditLog);
    }

    public void logActivity(User user, String activityType, String activityName, String activityDescription, String pageName, String metadataJson, String deviceInfo) {
        String ipAddress = "0.0.0.0";
        String devInfo = deviceInfo;
        if (request != null) {
            try {
                String xfHeader = request.getHeader("X-Forwarded-For");
                if (xfHeader == null || xfHeader.isEmpty()) {
                    ipAddress = request.getRemoteAddr();
                } else {
                    ipAddress = xfHeader.split(",")[0];
                }
                if (devInfo == null || devInfo.isEmpty()) {
                    devInfo = request.getHeader("User-Agent");
                }
            } catch (Exception e) {
                // Ignore context errors
            }
        }
        if (devInfo == null) {
            devInfo = "Unknown";
        }
        com.carbontracker.entity.UserActivityHistory history = com.carbontracker.entity.UserActivityHistory.builder()
                .user(user)
                .activityType(activityType)
                .activityName(activityName)
                .activityDescription(activityDescription)
                .pageName(pageName)
                .metadataJson(metadataJson)
                .ipAddress(ipAddress)
                .deviceInfo(devInfo)
                .build();
        userActivityHistoryRepository.save(history);
    }
}
