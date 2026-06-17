package com.wyme.hotail.modules.booking.repository;

import com.wyme.hotail.modules.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findAllByTenantId(String tenantId);
    List<Booking> findAllByGuestEmailOrderByCreatedAtDesc(String guestEmail);
    List<Booking> findAllByOwnerOrderByCreatedAtDesc(String owner);
    List<Booking> findAllByHotelIdOrderByCreatedAtDesc(String hotelId);
    List<Booking> findAllByOwnerAndCommissionAmountGreaterThan(String owner, Double amount);

    @Query("SELECT b FROM Booking b WHERE b.hotelId = :hotelId " +
           "AND b.status NOT IN ('Cancelled', 'Rejected') " +
           "AND b.checkIn < :end AND b.checkOut > :start")
    List<Booking> findOverlappingBookings(
            @Param("hotelId") String hotelId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
