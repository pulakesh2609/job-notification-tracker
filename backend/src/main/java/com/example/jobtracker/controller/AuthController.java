package com.example.jobtracker.controller;

import com.example.jobtracker.entity.OtpRecord;
import com.example.jobtracker.entity.User;
import com.example.jobtracker.repository.OtpRepository;
import com.example.jobtracker.repository.UserRepository;
import com.example.jobtracker.security.JwtUtil;
import com.example.jobtracker.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, OtpRepository otpRepository, 
                          NotificationService notificationService, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/send-otp")
    @Transactional
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        if (identifier == null || identifier.isEmpty()) {
            return ResponseEntity.badRequest().body("Identifier (Email or Phone) is required.");
        }

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(999999));

        // Save or update OTP record
        otpRepository.deleteByIdentifier(identifier);
        OtpRecord record = new OtpRecord();
        record.setIdentifier(identifier);
        record.setOtpCode(otpCode);
        record.setExpirationTime(LocalDateTime.now().plusMinutes(5));
        otpRepository.save(record);

        // Send OTP
        notificationService.sendOtp(identifier, otpCode);

        return ResponseEntity.ok(Map.of(
            "message", "OTP sent successfully",
            "mockOtpCode", otpCode
        ));
    }

    @PostMapping("/verify-otp")
    @Transactional
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String otpCode = request.get("otpCode");

        OtpRecord record = otpRepository.findByIdentifier(identifier).orElse(null);
        if (record == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP not found or expired.");
        }

        if (record.getExpirationTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(record);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP has expired.");
        }

        if (!record.getOtpCode().equals(otpCode)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP.");
        }

        // Clear OTP
        otpRepository.delete(record);

        // Create or find user
        User user;
        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(identifier);
                return userRepository.save(newUser);
            });
        } else {
            user = userRepository.findByPhoneNumber(identifier).orElseGet(() -> {
                User newUser = new User();
                newUser.setPhoneNumber(identifier);
                return userRepository.save(newUser);
            });
        }
        
        user.setAuthenticated(true);
        userRepository.save(user);

        // Generate JWT
        String token = jwtUtil.generateToken(identifier);
        return ResponseEntity.ok(Map.of("token", token, "message", "Authentication successful"));
    }
}
