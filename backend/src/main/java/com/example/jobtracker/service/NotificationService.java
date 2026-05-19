package com.example.jobtracker.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class NotificationService {
    
    private final JavaMailSender mailSender;

    @Value("${twilio.account.sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    public void initTwilio() {
        if (!"YOUR_TWILIO_ACCOUNT_SID".equals(twilioAccountSid) && twilioAccountSid != null) {
            Twilio.init(twilioAccountSid, twilioAuthToken);
        }
    }

    public void sendOtp(String identifier, String otpCode) {
        if (identifier.contains("@")) {
            sendEmailOtp(identifier, otpCode);
        } else {
            sendSmsOtp(identifier, otpCode);
        }
    }

    private void sendEmailOtp(String toEmail, String otpCode) {
        try {
            if ("YOUR_GMAIL_ADDRESS@gmail.com".equals(fromEmail) || fromEmail == null) {
                System.out.println("[MOCK] Would send Email OTP " + otpCode + " to " + toEmail + " (Credentials not configured)");
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Job Tracker Login OTP");
            message.setText("Your One-Time Password is: " + otpCode + "\n\nThis code will expire in 5 minutes.");
            mailSender.send(message);
            System.out.println("Actual Email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send actual email: " + e.getMessage());
            System.out.println("[FALLBACK MOCK] Email OTP: " + otpCode);
        }
    }

    private void sendSmsOtp(String toNumber, String otpCode) {
        try {
            if ("YOUR_TWILIO_ACCOUNT_SID".equals(twilioAccountSid) || twilioAccountSid == null) {
                System.out.println("[MOCK] Would send SMS OTP " + otpCode + " to " + toNumber + " (Twilio not configured)");
                return;
            }
            // Ensure number has format like +1234567890
            if (!toNumber.startsWith("+")) {
                // simple fallback if they just type 10 digits
                toNumber = "+" + toNumber; 
            }
            
            Message message = Message.creator(
                    new PhoneNumber(toNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    "Your Job Tracker Login OTP is: " + otpCode
            ).create();
            
            System.out.println("Actual SMS sent to " + toNumber + ", SID: " + message.getSid());
        } catch (Exception e) {
            System.err.println("Failed to send actual SMS: " + e.getMessage());
            System.out.println("[FALLBACK MOCK] SMS OTP: " + otpCode);
        }
    }
}
