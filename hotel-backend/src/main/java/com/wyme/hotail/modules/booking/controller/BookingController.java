package com.wyme.hotail.modules.booking.controller;

import com.wyme.hotail.modules.booking.entity.Booking;
import com.wyme.hotail.modules.booking.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @RequestParam(value = "guestEmail", required = false) String guestEmail,
            @RequestHeader(value = "x-owner-email", required = false) String owner,
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId) {
        return ResponseEntity.ok(bookingService.getBookings(guestEmail, owner, hotelId));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam("hotelId") String hotelId,
            @RequestParam(value = "roomName", required = false) String roomName,
            @RequestParam("checkIn") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkIn,
            @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkOut) {
        return ResponseEntity.ok(bookingService.checkAvailability(hotelId, roomName, checkIn, checkOut));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestHeader(value = "x-owner-email", required = false) String headerOwner,
            @RequestBody Booking booking) {
        if (booking.getOwner() == null || booking.getOwner().isEmpty()) {
            booking.setOwner(headerOwner != null ? headerOwner : "partner@yme.lk");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(booking));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }
}
