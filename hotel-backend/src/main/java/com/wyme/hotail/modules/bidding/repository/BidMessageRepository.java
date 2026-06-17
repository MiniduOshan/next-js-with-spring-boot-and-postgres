package com.wyme.hotail.modules.bidding.repository;

import com.wyme.hotail.modules.bidding.entity.BidMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BidMessageRepository extends JpaRepository<BidMessage, UUID> {
}
