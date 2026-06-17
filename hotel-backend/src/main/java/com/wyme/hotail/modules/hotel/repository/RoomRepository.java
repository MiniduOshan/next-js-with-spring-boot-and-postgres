package com.wyme.hotail.modules.hotel.repository;

import com.wyme.hotail.modules.hotel.entity.Room;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findAllByTenantId(String tenantId);
    List<Room> findAllByOwnerAndTenantId(String owner, String tenantId);
    List<Room> findAllByHotelIdAndTenantId(String hotelId, String tenantId);
    List<Room> findAllByHotelId(String hotelId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :id AND r.tenantId = :tenantId")
    Optional<Room> findAndLockRoomById(@Param("id") UUID id, @Param("tenantId") String tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.name = :name AND r.hotelId = :hotelId AND r.tenantId = :tenantId")
    Optional<Room> findAndLockRoomByNameAndHotelId(@Param("name") String name, @Param("hotelId") String hotelId, @Param("tenantId") String tenantId);
    
    Optional<Room> findByNameAndHotelId(String name, String hotelId);
}
