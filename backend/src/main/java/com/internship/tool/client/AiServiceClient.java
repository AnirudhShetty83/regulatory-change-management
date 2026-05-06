package com.internship.tool.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class AiServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(AiServiceClient.class);
    
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://ai-service:5000}")
    private String aiServiceUrl;

    public AiServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    public String generateSummary(String title, String description) {
        try {
            String url = aiServiceUrl + "/summarize";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String combinedText = "Title: " + title + "\nDescription: " + (description != null ? description : "");
            
            Map<String, String> body = new HashMap<>();
            body.put("text", combinedText);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getBody() != null && response.getBody().containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data.containsKey("summary")) {
                    return (String) data.get("summary");
                }
            }
            return "AI Summary unavailable.";
        } catch (Exception e) {
            logger.error("Failed to generate AI summary", e);
            return "AI Summary unavailable.";
        }
    }
}
