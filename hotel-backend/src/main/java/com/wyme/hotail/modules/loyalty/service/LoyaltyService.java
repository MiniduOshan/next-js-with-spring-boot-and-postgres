package com.wyme.hotail.modules.loyalty.service;

import com.wyme.hotail.core.exception.ResourceNotFoundException;
import com.wyme.hotail.modules.loyalty.entity.LoyaltyActivity;
import com.wyme.hotail.modules.loyalty.entity.UserActivityLog;
import com.wyme.hotail.modules.loyalty.entity.UserPointsSummary;
import com.wyme.hotail.modules.loyalty.repository.LoyaltyActivityRepository;
import com.wyme.hotail.modules.loyalty.repository.UserActivityLogRepository;
import com.wyme.hotail.modules.loyalty.repository.UserPointsSummaryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class LoyaltyService {

    private final LoyaltyActivityRepository loyaltyActivityRepository;
    private final UserActivityLogRepository userActivityLogRepository;
    private final UserPointsSummaryRepository userPointsSummaryRepository;

    public LoyaltyService(
            LoyaltyActivityRepository loyaltyActivityRepository,
            UserActivityLogRepository userActivityLogRepository,
            UserPointsSummaryRepository userPointsSummaryRepository) {
        this.loyaltyActivityRepository = loyaltyActivityRepository;
        this.userActivityLogRepository = userActivityLogRepository;
        this.userPointsSummaryRepository = userPointsSummaryRepository;
    }

    public List<LoyaltyActivity> getActivities() {
        return loyaltyActivityRepository.findAll();
    }

    public LoyaltyActivity createActivity(LoyaltyActivity activity) {
        return loyaltyActivityRepository.save(activity);
    }

    public LoyaltyActivity updateActivity(UUID id, LoyaltyActivity updated) {
        LoyaltyActivity existing = loyaltyActivityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found"));
        existing.setActivityName(updated.getActivityName());
        existing.setDescription(updated.getDescription());
        existing.setPoints(updated.getPoints());
        existing.setActivityType(updated.getActivityType());
        existing.setIsRepeatable(updated.getIsRepeatable());
        existing.setDailyLimit(updated.getDailyLimit());
        existing.setStatus(updated.getStatus());
        return loyaltyActivityRepository.save(existing);
    }

    public void deleteActivity(UUID id) {
        loyaltyActivityRepository.deleteById(id);
    }

    public UserPointsSummary awardPoints(String userEmail, String activityCode, String referenceId, String remarks) {
        LoyaltyActivity activity = loyaltyActivityRepository.findByActivityCodeAndStatus(activityCode, "active")
                .orElseThrow(() -> new ResourceNotFoundException("Active loyalty activity not found: " + activityCode));

        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);

        if (!activity.getIsRepeatable()) {
            boolean alreadyDone = userActivityLogRepository.findFirstByUserIdAndActivityId(userEmail, activityCode).isPresent();
            if (alreadyDone) {
                throw new IllegalArgumentException("Activity is non-repeatable and already completed");
            }
        }

        if (activity.getDailyLimit() > 0) {
            long dailyCount = userActivityLogRepository.countRecentLogs(userEmail, activityCode, startOfToday);
            if (dailyCount >= activity.getDailyLimit()) {
                throw new IllegalArgumentException("Daily limit reached for activity");
            }
        }

        // Award points
        UserActivityLog log = new UserActivityLog();
        log.setUserId(userEmail);
        log.setActivityId(activityCode);
        log.setPointsAwarded(activity.getPoints());
        log.setReferenceId(referenceId != null ? referenceId : "");
        log.setRemarks(remarks != null ? remarks : activity.getActivityName());
        userActivityLogRepository.save(log);

        UserPointsSummary summary = userPointsSummaryRepository.findByUserId(userEmail)
                .orElseGet(() -> {
                    UserPointsSummary newSummary = new UserPointsSummary();
                    newSummary.setUserId(userEmail);
                    return newSummary;
                });

        summary.setTotalPoints(summary.getTotalPoints() + activity.getPoints());
        summary.setAvailablePoints(summary.getAvailablePoints() + activity.getPoints());
        return userPointsSummaryRepository.save(summary);
    }

    public UserPointsSummary redeemPoints(String userEmail, int points, String remarks) {
        UserPointsSummary summary = userPointsSummaryRepository.findByUserId(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Loyalty profile not found for user: " + userEmail));

        if (summary.getAvailablePoints() < points) {
            throw new IllegalArgumentException("Insufficient points balance");
        }

        summary.setAvailablePoints(summary.getAvailablePoints() - points);
        summary.setRedeemedPoints(summary.getRedeemedPoints() + points);
        userPointsSummaryRepository.save(summary);

        UserActivityLog log = new UserActivityLog();
        log.setUserId(userEmail);
        log.setActivityId("redemption");
        log.setPointsAwarded(-points);
        log.setRemarks(remarks != null ? remarks : "Points Redeemed");
        userActivityLogRepository.save(log);

        return summary;
    }

    public UserPointsSummary getSummary(String userEmail) {
        return userPointsSummaryRepository.findByUserId(userEmail)
                .orElseGet(() -> {
                    UserPointsSummary empty = new UserPointsSummary();
                    empty.setUserId(userEmail);
                    return empty;
                });
    }

    public List<UserActivityLog> getLogs(String userEmail) {
        return userActivityLogRepository.findAllByUserIdOrderByCreatedAtDesc(userEmail);
    }

    public List<UserActivityLog> getAllLogs() {
        return userActivityLogRepository.findRecentLogs(PageRequest.of(0, 100));
    }

    public List<UserPointsSummary> getLeaderboard() {
        return userPointsSummaryRepository.findTopLeaderboard(PageRequest.of(0, 10));
    }
}
