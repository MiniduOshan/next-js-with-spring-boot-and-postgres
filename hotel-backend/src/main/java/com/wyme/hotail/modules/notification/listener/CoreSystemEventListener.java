package com.wyme.hotail.modules.notification.listener;

import com.wyme.hotail.modules.booking.entity.Booking;
import com.wyme.hotail.modules.booking.entity.BookingItem;
import com.wyme.hotail.modules.notification.entity.Notification;
import com.wyme.hotail.modules.notification.repository.NotificationRepository;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Component
public class CoreSystemEventListener {

    private final NotificationRepository notificationRepository;

    public CoreSystemEventListener(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Async
    @EventListener
    @Transactional
    public void handleBookingCreatedEvent(Booking booking) {
        String itemSummary = booking.getItems().stream()
                .map(item -> item.getName() + " (x" + item.getQuantity() + ")")
                .collect(Collectors.joining(", "));

        // Notify Guest
        Notification guestNotif = new Notification();
        guestNotif.setRecipientEmail(booking.getGuestEmail());
        guestNotif.setTitle("Trip Requested Successfully ⏳");
        guestNotif.setMessage("Your booking request for \"" + itemSummary + "\" has been successfully logged and is pending review.");
        guestNotif.setType("booking_status");
        guestNotif.setRelatedId(booking.getId().toString());
        guestNotif.setTenantId(booking.getTenantId());
        notificationRepository.save(guestNotif);

        // Notify Partner Owner
        Notification ownerNotif = new Notification();
        ownerNotif.setRecipientEmail(booking.getOwner());
        ownerNotif.setTitle("New Booking Request Received 🗓️");
        ownerNotif.setMessage("You have received a new booking request for \"" + itemSummary + "\" from " + booking.getGuestName() + ". Please review.");
        ownerNotif.setType("booking_status");
        ownerNotif.setRelatedId(booking.getId().toString());
        ownerNotif.setTenantId(booking.getTenantId());
        notificationRepository.save(ownerNotif);
    }
}
