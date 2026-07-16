package com.carbontracker.service;

import com.carbontracker.dto.*;
import com.carbontracker.entity.*;
import com.carbontracker.repository.UserRepository;
import com.carbontracker.config.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterUser_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setPassword("SecurePass@123");
        request.setConfirmPassword("SecurePass@123");
        request.setMobileNumber("+1223344");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        
        User mockedUser = User.builder()
                .id(2L)
                .fullName("Jane Doe")
                .email("jane@example.com")
                .password("hashedPassword")
                .role(Role.USER)
                .active(true)
                .build();
        
        when(userRepository.save(any(User.class))).thenReturn(mockedUser);

        User result = authService.register(request);

        assertNotNull(result);
        assertEquals("jane@example.com", result.getEmail());
        assertEquals("hashedPassword", result.getPassword());
        verify(userRepository, times(1)).save(any(User.class));
        verify(auditLogService, times(1)).log(any(), eq("REGISTRATION"), eq("User"), anyLong(), anyString());
    }

    @Test
    void testRegisterUser_DuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("duplicate@example.com");
        request.setPassword("SecurePass@123");
        request.setConfirmPassword("SecurePass@123");

        when(userRepository.existsByEmail("duplicate@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterUser_PasswordsDoNotMatch() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("SecurePass@123");
        request.setConfirmPassword("DifferentPass@123");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }
}
