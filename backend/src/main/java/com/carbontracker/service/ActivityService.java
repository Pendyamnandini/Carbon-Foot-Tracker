package com.carbontracker.service;

import com.carbontracker.dto.ActivityLogRequest;
import com.carbontracker.entity.*;
import com.carbontracker.repository.ActivityLogRepository;
import com.carbontracker.repository.EmissionFactorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private EmissionFactorRepository emissionFactorRepository;

    @Autowired
    private UserCarbonSummaryService summaryService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "analytics", allEntries = true)
    public ActivityLog logActivity(ActivityLogRequest request, User user) {
        if (request.getQuantity() < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        EmissionFactor factor = emissionFactorRepository.findByCategoryAndActivityTypeAndActiveTrue(
                request.getCategory(), request.getActivityType()
        ).orElseThrow(() -> new IllegalArgumentException(
                "No active emission factor found for category: " + request.getCategory() + " and activity: " + request.getActivityType()
        ));

        double carbonEmission = request.getQuantity() * factor.getFactor();

        ActivityLog log = ActivityLog.builder()
                .user(user)
                .category(request.getCategory())
                .activityType(request.getActivityType())
                .quantity(request.getQuantity())
                .unit(factor.getUnit())
                .emissionFactor(factor.getFactor())
                .carbonEmission(carbonEmission)
                .logDate(request.getLogDate())
                .build();

        ActivityLog savedLog = activityLogRepository.save(log);

        // Audit logging
        auditLogService.log(user, "CREATE_ACTIVITY", "ActivityLog", savedLog.getId(), "Logged " + request.getActivityType() + ": " + carbonEmission + " kg CO2");

        // Sync summaries and check achievements
        syncUserMetrics(user, request.getLogDate());

        return savedLog;
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "analytics", allEntries = true)
    public ActivityLog updateActivityLog(Long id, ActivityLogRequest request, User user) {
        ActivityLog existingLog = activityLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity log not found"));

        if (!existingLog.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied to edit this activity log");
        }

        if (request.getQuantity() < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        EmissionFactor factor = emissionFactorRepository.findByCategoryAndActivityTypeAndActiveTrue(
                request.getCategory(), request.getActivityType()
        ).orElseThrow(() -> new IllegalArgumentException(
                "No active emission factor found for activity type: " + request.getActivityType()
        ));

        double carbonEmission = request.getQuantity() * factor.getFactor();

        existingLog.setCategory(request.getCategory());
        existingLog.setActivityType(request.getActivityType());
        existingLog.setQuantity(request.getQuantity());
        existingLog.setUnit(factor.getUnit());
        existingLog.setEmissionFactor(factor.getFactor());
        existingLog.setCarbonEmission(carbonEmission);
        existingLog.setLogDate(request.getLogDate());

        ActivityLog updatedLog = activityLogRepository.save(existingLog);

        auditLogService.log(user, "UPDATE_ACTIVITY", "ActivityLog", updatedLog.getId(), "Updated activity: " + carbonEmission + " kg CO2");

        syncUserMetrics(user, request.getLogDate());

        return updatedLog;
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "analytics", allEntries = true)
    public void deleteActivityLog(Long id, User user) {
        ActivityLog existingLog = activityLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity log not found"));

        if (!existingLog.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied to delete this activity log");
        }

        activityLogRepository.delete(existingLog);

        auditLogService.log(user, "DELETE_ACTIVITY", "ActivityLog", id, "Deleted activity of category " + existingLog.getCategory());

        syncUserMetrics(user, existingLog.getLogDate());
    }

    public List<ActivityLog> getActivityLogsForUser(User user) {
        return activityLogRepository.findByUserIdOrderByLogDateDesc(user.getId());
    }

    public ActivityLog getActivityLogById(Long id, User user) {
        ActivityLog log = activityLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity log not found"));

        if (!log.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied to this log");
        }
        return log;
    }

    private void syncUserMetrics(User user, java.time.LocalDate date) {
        // Update the aggregated weekly carbon summaries
        summaryService.updateSummaryForUserAndDate(user, date);

        // Recalculate Active Goals progress
        goalService.recalculateGoalsForUser(user);

        // Publish ActivityLoggedEvent to decouple and check badges
        eventPublisher.publishEvent(new com.carbontracker.event.ActivityLoggedEvent(this, user));
    }
}
