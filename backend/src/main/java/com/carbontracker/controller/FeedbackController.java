package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.Feedback;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Feedback>> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        User user = getCurrentUser();
        Feedback feedback = feedbackService.submitFeedback(request, user);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", feedback));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getMyFeedback() {
        User user = getCurrentUser();
        List<FeedbackResponse> myFeedback = feedbackService.getFeedbackForUser(user);
        return ResponseEntity.ok(ApiResponse.success(myFeedback));
    }
}
