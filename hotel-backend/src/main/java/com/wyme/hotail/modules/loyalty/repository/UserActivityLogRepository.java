package com.wyme.hotail.modules.loyalty.repository;

import com.wyme.hotail.modules.loyalty.entity.UserActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, UUID> {
    List<UserActivityLog> findAllByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT COUNT(u) FROM UserActivityLog u WHERE u.userId = :userId AND u.activityId = :activityId AND u.createdAt >= :since")
    long countRecentLogs(
            @Param("userId") String userId,
            @Param("activityId") String activityId,
            @Param("since") LocalDateTime since);

    Optional<UserActivityLog> findFirstByUserIdAndActivityId(String userId, String activityId);

    @Query("SELECT u FROM UserActivityLog u ORDER BY u.createdAt DESC")
    List<UserActivityLog> findRecentLogs(Pageable pageable);
}
