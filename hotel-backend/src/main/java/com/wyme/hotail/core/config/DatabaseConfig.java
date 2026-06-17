package com.wyme.hotail.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class DatabaseConfig {
    // Basic config class enabling transactional management.
    // Specific Neon cloud-native settings are configured in application.yml datasource properties.
}
