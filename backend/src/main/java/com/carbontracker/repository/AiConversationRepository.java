package com.carbontracker.repository;

import com.carbontracker.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findByUserIdAndRoleOrderByCreatedAtDesc(Long userId, String role);
}
