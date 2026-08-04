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
