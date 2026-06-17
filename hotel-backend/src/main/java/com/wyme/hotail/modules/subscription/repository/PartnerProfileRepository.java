package com.wyme.hotail.modules.subscription.repository;

import com.wyme.hotail.modules.subscription.entity.PartnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnerProfileRepository extends JpaRepository<PartnerProfile, UUID> {
    Optional<PartnerProfile> findByEmail(String email);
    Optional<PartnerProfile> findByEmailAndTenantId(String email, String tenantId);
}
