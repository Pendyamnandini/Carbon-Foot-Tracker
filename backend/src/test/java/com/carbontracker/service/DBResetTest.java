package com.carbontracker.service;

import com.carbontracker.entity.*;
import com.carbontracker.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@SpringBootTest
@ActiveProfiles("dev")
public class DBResetTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AiConversationRepository aiConversationRepository;
    
    @Autowired
    private AiMessageRepository aiMessageRepository;

    @Test
    @Transactional
    public void verifyChatbotDatabaseTables() {
        System.out.println(">>> DBResetTest: Verifying Chatbot Database tables...");
        
        long initialCount = aiConversationRepository.count();
        System.out.println("  Initial ai_conversations count: " + initialCount);
        
        AiConversation testConv = AiConversation.builder()
                .title("Verify Database Test")
                .userId(1L)
                .role("USER")
                .build();
        testConv = aiConversationRepository.save(testConv);
        System.out.println("  Successfully saved test conversation. ID: " + testConv.getId());
        
        AiMessage testMsg = AiMessage.builder()
                .conversationId(testConv.getId())
                .sender("BOT")
                .content("Database tables verified successfully!")
                .build();
        testMsg = aiMessageRepository.save(testMsg);
        System.out.println("  Successfully saved test message. ID: " + testMsg.getId());
        
        long newCount = aiConversationRepository.count();
        System.out.println("  New ai_conversations count: " + newCount);
        
        aiMessageRepository.delete(testMsg);
        aiConversationRepository.delete(testConv);
        System.out.println("  Cleaned up test conversation and message. Final count: " + aiConversationRepository.count());
        System.out.println(">>> DBResetTest: Chatbot Database verification PASSED!");
    }

    @Test
    @Rollback(false)
    public void resetAdminPassword() {
        System.out.println(">>> DBResetTest: Inspecting users in the database...");
        List<User> users = userRepository.findAll();
        for (User u : users) {
            System.out.println("  User: " + u.getEmail() + " | Role: " + u.getRole() + " | Active: " + u.isActive());
        }

        // Find admin@carbontracker.com
        Optional<User> adminOpt = userRepository.findByEmail("admin@carbontracker.com");
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println(">>> DBResetTest: admin@carbontracker.com password successfully updated to 'Admin@123'");
        } else {
            User admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@carbontracker.com")
                    .mobileNumber("+1234567890")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println(">>> DBResetTest: admin@carbontracker.com created successfully with password 'Admin@123'");
        }
    }
}
