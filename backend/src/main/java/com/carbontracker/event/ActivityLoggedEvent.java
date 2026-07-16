package com.carbontracker.event;

import com.carbontracker.entity.User;
import org.springframework.context.ApplicationEvent;

public class ActivityLoggedEvent extends ApplicationEvent {
    private final User user;

    public ActivityLoggedEvent(Object source, User user) {
        super(source);
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}
