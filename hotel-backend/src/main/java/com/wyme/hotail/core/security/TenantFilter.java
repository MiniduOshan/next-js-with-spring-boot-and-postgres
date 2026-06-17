package com.wyme.hotail.core.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class TenantFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // Try getting Tenant from X-Tenant-ID first, then fallback to x-owner-email header
        String tenantId = httpRequest.getHeader("X-Tenant-ID");
        if (tenantId == null || tenantId.trim().isEmpty()) {
            tenantId = httpRequest.getHeader("x-owner-email");
        }
        
        // Fallback to "default" if not supplied to ensure no NullPointerExceptions
        if (tenantId == null || tenantId.trim().isEmpty()) {
            tenantId = "default";
        }

        TenantContext.setCurrentTenant(tenantId.toLowerCase().trim());

        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
