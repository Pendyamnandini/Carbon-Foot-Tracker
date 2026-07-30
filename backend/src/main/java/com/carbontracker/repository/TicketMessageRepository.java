package com.carbontracker.repository;

import com.carbontracker.entity.Ticket;
import com.carbontracker.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicketOrderByCreatedAtAsc(Ticket ticket);
}
