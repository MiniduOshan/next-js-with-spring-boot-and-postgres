package com.wyme.hotail.modules.loyalty.repository;

import com.wyme.hotail.modules.loyalty.entity.LoyaltyActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoyaltyActivityRepository extends JpaRepository<LoyaltyActivity, UUID> {
    Optional<LoyaltyActivity> findByActivityCodeAndStatus(String activityCode, String status);
}
