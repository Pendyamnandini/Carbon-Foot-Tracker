package com.carbontracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Password Reset OTP";
        String body = "Dear User,\n\n" +
                "Your OTP is:\n\n" +
                otp + "\n\n" +
                "This OTP is valid for 10 minutes.\n\n" +
                "Regards,\n" +
                "Carbon Tracker Team";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("no-reply@carbontracker.com");
                mailSender.send(message);
                return;
            } catch (Exception e) {
                System.err.println("Failed to send email via SMTP, falling back to console print: " + e.getMessage());
            }
        }

        // Console fallback
        System.out.println("=================================================");
        System.out.println("MOCK EMAIL SENDER (No SMTP active)");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: " + subject);
        System.out.println("Body:\n" + body);
        System.out.println("=================================================");
    }
}
