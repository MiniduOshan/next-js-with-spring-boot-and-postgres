package com.wyme.hotail.modules.booking.service;

import com.wyme.hotail.core.exception.OutOfInventoryException;
import com.wyme.hotail.core.exception.ResourceNotFoundException;
import com.wyme.hotail.core.security.TenantContext;
import com.wyme.hotail.modules.booking.entity.Booking;
import com.wyme.hotail.modules.booking.entity.BookingItem;
import com.wyme.hotail.modules.booking.repository.BookingRepository;
import com.wyme.hotail.modules.hotel.entity.Room;
import com.wyme.hotail.modules.hotel.repository.RoomRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final ApplicationEventPublisher eventPublisher;

    public BookingService(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            ApplicationEventPublisher eventPublisher) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<Booking> getBookings(String guestEmail, String owner, String hotelId) {
        if (guestEmail != null && !guestEmail.isEmpty()) {
            return bookingRepository.findAllByGuestEmailOrderByCreatedAtDesc(guestEmail);
        } else if (owner != null && !owner.isEmpty()) {
            return bookingRepository.findAllByOwnerOrderByCreatedAtDesc(owner);
        } else if (hotelId != null && !hotelId.isEmpty()) {
            return bookingRepository.findAllByHotelIdOrderByCreatedAtDesc(hotelId);
        }
        return bookingRepository.findAllByTenantId(TenantContext.getCurrentTenant());
    }

    public Map<String, Object> checkAvailability(String hotelId, String roomName, LocalDateTime checkIn, LocalDateTime checkOut) {
        String tenantId = TenantContext.getCurrentTenant();
        List<Room> rooms = roomRepository.findAllByHotelIdAndTenantId(hotelId, tenantId);
        List<Booking> overlaps = bookingRepository.findOverlappingBookings(hotelId, checkIn, checkOut);

        List<Map<String, Object>> details = new ArrayList<>();
        boolean isAvailable = false;

        for (Room room : rooms) {
            int bookedQty = overlaps.stream()
                    .flatMap(b -> b.getItems().stream())
                    .filter(item -> item.getName().equalsIgnoreCase(room.getName()))
                    .mapToInt(BookingItem::getQuantity)
                    .sum();

            int remaining = Math.max(0, room.getQty() - bookedQty);
            boolean available = bookedQty < room.getQty();

            Map<String, Object> detail = new HashMap<>();
            detail.put("name", room.getName());
            detail.put("total", room.getQty());
            detail.put("remaining", remaining);
            detail.put("available", available);
            details.add(detail);

            if (roomName != null && room.getName().equalsIgnoreCase(roomName)) {
                isAvailable = available;
            } else if (roomName == null && available) {
                isAvailable = true;
            }
        }

        return Map.of("available", isAvailable, "details", details);
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        String tenantId = TenantContext.getCurrentTenant();
        booking.setTenantId(tenantId);
        booking.setCreatedAt(LocalDateTime.now());
        
        // PESSIMISTIC LOCK: Lock rooms and check quantities before committing booking
        for (BookingItem item : booking.getItems()) {
            Room lockedRoom = roomRepository.findAndLockRoomByNameAndHotelId(item.getName(), booking.getHotelId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + item.getName()));
            
            // Check overlaps for specific dates
            List<Booking> overlaps = bookingRepository.findOverlappingBookings(booking.getHotelId(), booking.getCheckIn(), booking.getCheckOut());
            int bookedQty = overlaps.stream()
                    .flatMap(b -> b.getItems().stream())
                    .filter(i -> i.getName().equalsIgnoreCase(lockedRoom.getName()))
                    .mapToInt(BookingItem::getQuantity)
                    .sum();
            
            if (bookedQty + item.getQuantity() > lockedRoom.getQty()) {
                throw new OutOfInventoryException("Insufficient inventory for room type: " + lockedRoom.getName());
            }
            
            item.setBooking(booking);
        }

        Booking saved = bookingRepository.save(booking);

        // Publish event for async processing (email notifications, loyalty points, etc.)
        eventPublisher.publishEvent(saved);

        return saved;
    }

    @Transactional
    public Booking updateBookingStatus(UUID id, String newStatus) {
        String tenantId = TenantContext.getCurrentTenant();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        String oldStatus = booking.getStatus();
        booking.setStatus(newStatus);
        Booking updated = bookingRepository.save(booking);

        // Inventory adjustment based on status transition
        if (newStatus.equalsIgnoreCase("Approved") && !oldStatus.equalsIgnoreCase("Approved")) {
            for (BookingItem item : updated.getItems()) {
                Room room = roomRepository.findAndLockRoomByNameAndHotelId(item.getName(), updated.getHotelId(), tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + item.getName()));
                room.setQty(Math.max(0, room.getQty() - item.getQuantity()));
                roomRepository.save(room);
            }
        } else if ((newStatus.equalsIgnoreCase("Cancelled") || newStatus.equalsIgnoreCase("Rejected"))
                && oldStatus.equalsIgnoreCase("Approved")) {
            for (BookingItem item : updated.getItems()) {
                Room room = roomRepository.findAndLockRoomByNameAndHotelId(item.getName(), updated.getHotelId(), tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + item.getName()));
                room.setQty(room.getQty() + item.getQuantity());
                roomRepository.save(room);
            }
        }

        // Publish status update event for async listeners
        eventPublisher.publishEvent(updated);

        return updated;
    }
}
