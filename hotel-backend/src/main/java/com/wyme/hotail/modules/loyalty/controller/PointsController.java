package com.wyme.hotail.modules.loyalty.controller;

import com.wyme.hotail.modules.loyalty.entity.LoyaltyActivity;
import com.wyme.hotail.modules.loyalty.entity.UserActivityLog;
import com.wyme.hotail.modules.loyalty.entity.UserPointsSummary;
import com.wyme.hotail.modules.loyalty.service.LoyaltyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/loyalty")
public class PointsController {

    private final LoyaltyService loyaltyService;

    public PointsController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping("/activities")
    public ResponseEntity<List<LoyaltyActivity>> getActivities() {
        return ResponseEntity.ok(loyaltyService.getActivities());
    }

    @PostMapping("/activities")
    public ResponseEntity<LoyaltyActivity> createActivity(@RequestBody LoyaltyActivity activity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loyaltyService.createActivity(activity));
    }

    @PutMapping("/activities/{id}")
    public ResponseEntity<LoyaltyActivity> updateActivity(@PathVariable("id") UUID id, @RequestBody LoyaltyActivity activity) {
        return ResponseEntity.ok(loyaltyService.updateActivity(id, activity));
    }

    @DeleteMapping("/activities/{id}")
    public ResponseEntity<?> deleteActivity(@PathVariable("id") UUID id) {
        loyaltyService.deleteActivity(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/award")
    public ResponseEntity<?> awardPoints(@RequestBody Map<String, Object> body) {
        String userEmail = (String) body.get("user_email");
        String activityCode = (String) body.get("activity_code");
        String referenceId = (String) body.get("reference_id");
        String remarks = (String) body.get("remarks");
        
        UserPointsSummary summary = loyaltyService.awardPoints(userEmail, activityCode, referenceId, remarks);
        return ResponseEntity.ok(Map.of("success", true, "summary", summary));
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemPoints(@RequestBody Map<String, Object> body) {
        String userEmail = (String) body.get("user_email");
        int points = (Integer) body.get("points_to_redeem");
        String remarks = (String) body.get("remarks");
        
        UserPointsSummary summary = loyaltyService.redeemPoints(userEmail, points, remarks);
        return ResponseEntity.ok(Map.of("success", true, "summary", summary));
    }

    @GetMapping("/summary/{email}")
    public ResponseEntity<?> getSummary(@PathVariable("email") String email) {
        UserPointsSummary summary = loyaltyService.getSummary(email);
        List<UserActivityLog> logs = loyaltyService.getLogs(email);
        return ResponseEntity.ok(Map.of("summary", summary, "logs", logs));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<UserActivityLog>> getLogs() {
        return ResponseEntity.ok(loyaltyService.getAllLogs());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserPointsSummary>> getLeaderboard() {
        return ResponseEntity.ok(loyaltyService.getLeaderboard());
    }
}
