package com.internship.tool.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    // Mocking email sending for now as requested. 
    // Later, inject JavaMailSender here to send real emails.

    public void sendOverdueAlert(String title, String deadline) {
        logger.warn(">>> EMAIL SENT: [OVERDUE ALERT] Regulatory Change '{}' was due on {}!", title, deadline);
    }

    public void sendAdvanceDeadlineAlert(String title, String deadline) {
        logger.info(">>> EMAIL SENT: [UPCOMING DEADLINE] Regulatory Change '{}' is due in 7 days on {}.", title, deadline);
    }

    public void sendWeeklySummary(int activeCount, int overdueCount) {
        logger.info(">>> EMAIL SENT: [WEEKLY SUMMARY] You have {} active tasks, {} of which are overdue.", activeCount, overdueCount);
    }
}
