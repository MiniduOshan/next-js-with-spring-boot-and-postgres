package com.wyme.hotail.modules.subscription.repository;

import com.wyme.hotail.modules.subscription.entity.SystemPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemPackageRepository extends JpaRepository<SystemPackage, UUID> {
    Optional<SystemPackage> findByName(String name);
}
