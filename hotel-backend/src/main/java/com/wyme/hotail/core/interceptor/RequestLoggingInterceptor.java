package com.wyme.hotail.core.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String correlationId = UUID.randomUUID().toString();
        request.setAttribute("correlationId", correlationId);
        logger.info("Incoming Request: [{} {}] - ID: {}", request.getMethod(), request.getRequestURI(), correlationId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String correlationId = (String) request.getAttribute("correlationId");
        logger.info("Completed Request: [{} {}] - ID: {} - Status: {}", request.getMethod(), request.getRequestURI(), correlationId, response.getStatus());
    }
}
