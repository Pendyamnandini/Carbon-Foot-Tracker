package com.carbontracker.repository;

import com.carbontracker.entity.Ticket;
import com.carbontracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUser(User user);
    Optional<Ticket> findByTicketId(String ticketId);
}
