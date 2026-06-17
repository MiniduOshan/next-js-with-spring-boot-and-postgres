package com.wyme.hotail.modules.bidding.repository;

import com.wyme.hotail.modules.bidding.entity.BidRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BidRequestRepository extends JpaRepository<BidRequest, UUID> {
    List<BidRequest> findAllByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<BidRequest> findAllByStatusOrderByCreatedAtDesc(String status);
    List<BidRequest> findAllByUserEmailAndStatusOrderByCreatedAtDesc(String userEmail, String status);
}
