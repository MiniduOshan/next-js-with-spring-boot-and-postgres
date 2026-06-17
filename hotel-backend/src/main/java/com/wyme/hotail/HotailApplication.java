package com.wyme.hotail;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HotailApplication {
    public static void main(String[] args) {
        SpringApplication.run(HotailApplication.class, args);
    }
}
