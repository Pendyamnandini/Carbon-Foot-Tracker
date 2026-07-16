package com.carbontracker.event;

import com.carbontracker.entity.Goal;
import com.carbontracker.entity.NotificationType;
import com.carbontracker.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AchievementListener {

    @Autowired
    private NotificationService notificationService;

    @EventListener
    public void handleGoalProgress(GoalProgressEvent event) {
        Goal goal = event.getGoal();
        double progress = goal.getCurrentProgress();
        
        // Progress milestones
        if (progress >= 25.0 && progress < 30.0) {
            notificationService.createNotification(
                    goal.getUser(),
                    "Weekly Milestone: 25% Reached! 📈",
                    "Keep going! You've achieved 25% of your reduction target for: " + goal.getGoalTitle(),
                    NotificationType.INFO
            );
        } else if (progress >= 50.0 && progress < 55.0) {
            notificationService.createNotification(
                    goal.getUser(),
                    "Halfway There: 50% Achieved! 🎉",
                    "Awesome work! You are halfway to your carbon reduction goal: " + goal.getGoalTitle(),
                    NotificationType.INFO
            );
        } else if (progress >= 75.0 && progress < 80.0) {
            notificationService.createNotification(
                    goal.getUser(),
                    "Almost Completed: 75% Done! 🚀",
                    "Almost there! Your goal '" + goal.getGoalTitle() + "' is 75% complete.",
                    NotificationType.INFO
            );
        }
    }
}
