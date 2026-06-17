package com.wyme.hotail.modules.bidding.repository;

import com.wyme.hotail.modules.bidding.entity.BidOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BidOfferRepository extends JpaRepository<BidOffer, UUID> {
    List<BidOffer> findAllByRequestIdOrderByCreatedAtDesc(UUID requestId);
    List<BidOffer> findAllByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);
}
