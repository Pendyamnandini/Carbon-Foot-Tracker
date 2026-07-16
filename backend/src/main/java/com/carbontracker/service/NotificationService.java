package com.carbontracker.service;

import com.carbontracker.entity.Notification;
import com.carbontracker.entity.NotificationType;
import com.carbontracker.entity.User;
import com.carbontracker.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public Notification markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied to notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
