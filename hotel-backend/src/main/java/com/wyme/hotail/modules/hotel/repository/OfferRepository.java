package com.wyme.hotail.modules.hotel.repository;

import com.wyme.hotail.modules.hotel.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {
    List<Offer> findAllByActiveOrderByIdDesc(Boolean active);
    List<Offer> findAllByTenantId(String tenantId);
    List<Offer> findAllByHotelIdAndTenantId(String hotelId, String tenantId);
    List<Offer> findAllByOwnerAndTenantId(String owner, String tenantId);
}
