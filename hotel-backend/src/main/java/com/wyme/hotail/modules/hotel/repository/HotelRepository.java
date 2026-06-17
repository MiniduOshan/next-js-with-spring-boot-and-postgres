package com.wyme.hotail.modules.hotel.repository;

import com.wyme.hotail.modules.hotel.entity.HotelProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HotelRepository extends JpaRepository<HotelProfile, UUID> {
    List<HotelProfile> findAllByTenantId(String tenantId);
    Optional<HotelProfile> findByIdAndTenantId(UUID id, String tenantId);
    Optional<HotelProfile> findByOwnerAndTenantId(String owner, String tenantId);
    Optional<HotelProfile> findByOwner(String owner);

    @Query("SELECT h FROM HotelProfile h WHERE h.owner = :ownerEmail OR EXISTS (SELECT s FROM StaffMember s WHERE s.hotelProfile = h AND s.email = :ownerEmail)")
    List<HotelProfile> findAccessibleHotels(@Param("ownerEmail") String ownerEmail);

    @Query("SELECT h FROM HotelProfile h WHERE h.staff IS EMPTY OR EXISTS (SELECT s FROM StaffMember s WHERE s.hotelProfile = h AND s.email = :email AND s.password = :password)")
    Optional<HotelProfile> findByStaffCredentials(@Param("email") String email, @Param("password") String password);
}
