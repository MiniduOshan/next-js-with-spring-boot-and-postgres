package com.wyme.hotail.modules.hotel.repository;

import com.wyme.hotail.modules.hotel.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findAllByTenantId(String tenantId);
    List<Review> findAllByHotelIdAndTenantId(String hotelId, String tenantId);
    List<Review> findAllByOwnerAndTenantId(String owner, String tenantId);
}
