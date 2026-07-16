package com.carbontracker.service;

import com.carbontracker.dto.FeedbackRequest;
import com.carbontracker.dto.FeedbackResponse;
import com.carbontracker.entity.*;
import com.carbontracker.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public Feedback submitFeedback(FeedbackRequest request, User user) {
        Feedback feedback = Feedback.builder()
                .user(user)
                .feedbackText(request.getFeedbackText())
                .category(request.getCategory())
                .status(FeedbackStatus.OPEN)
                .build();

        Feedback saved = feedbackRepository.save(feedback);

        auditLogService.log(user, "SUBMIT_FEEDBACK", "Feedback", saved.getId(), "Submitted feedback of category: " + request.getCategory());
        return saved;
    }

    public List<FeedbackResponse> getFeedbackForUser(User user) {
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponse> getAllFeedbackForAdmin() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Feedback updateFeedbackStatus(Long feedbackId, FeedbackStatus status, User adminUser) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found"));

        feedback.setStatus(status);
        Feedback saved = feedbackRepository.save(feedback);

        auditLogService.log(adminUser, "RESOLVE_FEEDBACK", "Feedback", saved.getId(), "Updated feedback status to: " + status);
        return saved;
    }

    private FeedbackResponse mapToResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId())
                .userId(f.getUser() != null ? f.getUser().getId() : null)
                .userName(f.getUser() != null ? f.getUser().getFullName() : "Anonymous")
                .feedbackText(f.getFeedbackText())
                .category(f.getCategory().name())
                .status(f.getStatus().name())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
