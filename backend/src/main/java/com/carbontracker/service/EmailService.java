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

    public void sendGoalAchievementEmail(String toEmail, String goalTitle) {
        String subject = "🎉 Congratulations! Goal Achieved";
        String body = "Congratulations!\n\n" +
                "You have successfully achieved your sustainability goal: " + goalTitle + ".\n\n" +
                "Your efforts have reduced your carbon footprint and contributed positively to environmental sustainability.\n\n" +
                "Keep up the excellent work!\n\n" +
                "Regards,\n" +
                "Carbon Tracker Team";

        sendGenericEmail(toEmail, subject, body);
    }

    public void sendMilestoneAchievementEmail(String toEmail, String milestoneName, String description) {
        String subject = "🏆 Milestone Reached: " + milestoneName;
        String body = "Congratulations!\n\n" +
                "You have unlocked a new sustainability milestone: " + milestoneName + "!\n\n" +
                description + "\n\n" +
                "Thank you for leading the change towards a greener planet.\n\n" +
                "Regards,\n" +
                "Carbon Tracker Team";

        sendGenericEmail(toEmail, subject, body);
    }

    public void sendGoalStatusAlertEmail(String toEmail, String goalTitle, boolean isAhead) {
        String subject;
        String body;

        if (isAhead) {
            subject = "🚀 Great Progress on Your Goal!";
            body = "Great news!\n\n" +
                    "You are currently ahead of your sustainability target for: " + goalTitle + ".\n\n" +
                    "Keep maintaining your current habits to achieve even greater environmental impact.\n\n" +
                    "Regards,\n" +
                    "Carbon Tracker Team";
        } else {
            subject = "⚠ Sustainability Goal Needs Attention";
            body = "Attention Required:\n\n" +
                    "Your goal '" + goalTitle + "' is currently behind schedule.\n\n" +
                    "Recommended actions:\n" +
                    "• Reduce transport emissions\n" +
                    "• Lower electricity consumption\n" +
                    "• Follow personalized recommendations on your dashboard\n\n" +
                    "Keep tracking your activities and continue improving!\n\n" +
                    "Regards,\n" +
                    "Carbon Tracker Team";
        }

        sendGenericEmail(toEmail, subject, body);
    }

    private void sendGenericEmail(String toEmail, String subject, String body) {
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

        System.out.println("=================================================");
        System.out.println("MOCK EMAIL SENDER (No SMTP active)");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: " + subject);
        System.out.println("Body:\n" + body);
        System.out.println("=================================================");
    }
}
