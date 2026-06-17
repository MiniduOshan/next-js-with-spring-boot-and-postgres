package com.wyme.hotail.modules.notification.service;

import com.wyme.hotail.core.exception.ResourceNotFoundException;
import com.wyme.hotail.core.security.TenantContext;
import com.wyme.hotail.modules.notification.entity.Notification;
import com.wyme.hotail.modules.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotifications(String recipientEmail) {
        String tenantId = TenantContext.getCurrentTenant();
        return notificationRepository.findAllByRecipientEmailAndTenantIdOrderByCreatedAtDesc(recipientEmail, tenantId);
    }

    public Notification createNotification(Notification notification) {
        notification.setTenantId(TenantContext.getCurrentTenant());
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String recipientEmail) {
        String tenantId = TenantContext.getCurrentTenant();
        List<Notification> list = notificationRepository.findAllByRecipientEmailAndTenantIdOrderByCreatedAtDesc(recipientEmail, tenantId);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }

    public void deleteNotification(UUID id) {
        notificationRepository.deleteById(id);
    }
}
