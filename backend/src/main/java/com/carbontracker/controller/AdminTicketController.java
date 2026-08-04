package com.carbontracker.controller;

import com.carbontracker.dto.*;
import com.carbontracker.entity.User;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllTickets() {
        List<TicketResponse> res = ticketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
            @PathVariable String ticketId,
            @RequestBody TicketUpdateRequest request) {
        User admin = getCurrentUser();
        TicketResponse res = ticketService.updateTicket(ticketId, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Ticket updated successfully", res));
    }

    @PostMapping("/{ticketId}/resolve")
    public ResponseEntity<ApiResponse<TicketResponse>> resolveTicket(
            @PathVariable String ticketId,
            @RequestBody(required = false) TicketResolveRequest request) {
        User admin = getCurrentUser();
        TicketResponse res = ticketService.resolveTicket(ticketId, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Ticket resolved successfully", res));
    }

    @PostMapping("/{ticketId}/merge")
    public ResponseEntity<ApiResponse<String>> mergeTickets(
            @PathVariable String ticketId,
            @RequestParam String duplicateId) {
        User admin = getCurrentUser();
        ticketService.mergeTickets(ticketId, duplicateId, admin);
        return ResponseEntity.ok(ApiResponse.success("Tickets merged successfully", null));
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<String>> deleteTicket(@PathVariable String ticketId) {
        User admin = getCurrentUser();
        ticketService.deleteTicket(ticketId, admin);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted successfully", null));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> res = ticketService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success(res));
    }
}
