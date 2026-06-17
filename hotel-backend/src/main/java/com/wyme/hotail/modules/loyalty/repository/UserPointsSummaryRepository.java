package com.wyme.hotail.modules.loyalty.repository;

import com.wyme.hotail.modules.loyalty.entity.UserPointsSummary;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPointsSummaryRepository extends JpaRepository<UserPointsSummary, UUID> {
    Optional<UserPointsSummary> findByUserId(String userId);

    @Query("SELECT u FROM UserPointsSummary u ORDER BY u.totalPoints DESC")
    List<UserPointsSummary> findTopLeaderboard(Pageable pageable);
}
