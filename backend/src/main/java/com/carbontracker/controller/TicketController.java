package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        User user = getCurrentUser();
        TicketResponse res = ticketService.createTicket(request, user);
        return ResponseEntity.ok(ApiResponse.success("Ticket raised successfully", res));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets() {
        User user = getCurrentUser();
        List<TicketResponse> res = ticketService.getUserTickets(user);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketDetails(@PathVariable String ticketId) {
        User user = getCurrentUser();
        TicketResponse res = ticketService.getTicketDetails(ticketId, user);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/{ticketId}/messages")
    public ResponseEntity<ApiResponse<TicketResponse>> addMessage(
            @PathVariable String ticketId,
            @RequestBody TicketMessageRequest request) {
        User user = getCurrentUser();
        TicketResponse res = ticketService.addMessage(ticketId, request, user);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", res));
    }

    @PostMapping("/{ticketId}/feedback")
    public ResponseEntity<ApiResponse<TicketResponse>> addFeedback(
            @PathVariable String ticketId,
            @RequestBody TicketFeedbackRequest request) {
        User user = getCurrentUser();
        TicketResponse res = ticketService.addFeedback(ticketId, request, user);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", res));
    }
}
