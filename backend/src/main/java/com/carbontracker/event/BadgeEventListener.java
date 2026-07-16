package com.carbontracker.event;

import com.carbontracker.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class BadgeEventListener {

    @Autowired
    private BadgeService badgeService;

    @EventListener
    public void handleActivityLogged(ActivityLoggedEvent event) {
        badgeService.checkAndAwardBadges(event.getUser());
    }

    @EventListener
    public void handleGoalCompleted(GoalCompletedEvent event) {
        badgeService.checkAndAwardBadges(event.getUser());
    }
}
