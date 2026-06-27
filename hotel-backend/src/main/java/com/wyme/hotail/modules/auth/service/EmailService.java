package com.wyme.hotail.modules.auth.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Your YME Hotels Verification Code");
            message.setText("Welcome to YME Hotels! Your verification code is: " + code + "\n\nPlease enter this code to activate your account.");
            
            mailSender.send(message);
            System.out.println("Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            // We catch the exception so that the main flow (like signup or reset) 
            // doesn't fail completely if the email credentials are not set up yet.
        }
    }

    public void sendPasswordResetCode(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Your YME Hotels Password Reset Code");
            message.setText("You requested a password reset. Your reset code is: " + code + "\n\nIf you did not request this, please ignore this email.");
            
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send reset email to " + to + ": " + e.getMessage());
        }
    }
}
