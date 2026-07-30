package com.carbontracker.repository;

import com.carbontracker.entity.Ticket;
import com.carbontracker.entity.TicketTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketTimelineRepository extends JpaRepository<TicketTimeline, Long> {
    List<TicketTimeline> findByTicketOrderByCreatedAtAsc(Ticket ticket);
}
