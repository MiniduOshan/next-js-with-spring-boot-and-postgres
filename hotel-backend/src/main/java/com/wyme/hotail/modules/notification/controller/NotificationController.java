package com.wyme.hotail.modules.notification.controller;

import com.wyme.hotail.modules.notification.entity.Notification;
import com.wyme.hotail.modules.notification.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestHeader("x-recipient-email") String recipientEmail) {
        return ResponseEntity.ok(notificationService.getNotifications(recipientEmail));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.createNotification(notification));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> readNotification(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> readAllNotifications(@RequestHeader("x-recipient-email") String recipientEmail) {
        notificationService.markAllAsRead(recipientEmail);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable("id") UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
