package com.carbontracker.event;

import com.carbontracker.entity.Goal;
import org.springframework.context.ApplicationEvent;

public class GoalProgressEvent extends ApplicationEvent {
    private final Goal goal;

    public GoalProgressEvent(Object source, Goal goal) {
        super(source);
        this.goal = goal;
    }

    public Goal getGoal() {
        return goal;
    }
}
