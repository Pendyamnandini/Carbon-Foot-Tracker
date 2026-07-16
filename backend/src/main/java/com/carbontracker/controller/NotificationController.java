package com.carbontracker.controller;

import com.carbontracker.dto.ApiResponse;
import com.carbontracker.entity.Notification;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        User user = getCurrentUser();
        List<Notification> list = notificationService.getNotificationsForUser(user);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markNotificationAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        Notification notification = notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", notification));
    }
}
