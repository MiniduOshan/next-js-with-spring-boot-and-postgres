package com.wyme.hotail.modules.subscription.controller;

import com.wyme.hotail.modules.subscription.entity.PartnerProfile;
import com.wyme.hotail.modules.subscription.entity.SystemPackage;
import com.wyme.hotail.modules.subscription.service.SubscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/system-packages")
    public ResponseEntity<List<SystemPackage>> getPackages() {
        return ResponseEntity.ok(subscriptionService.getSystemPackages());
    }

    @PostMapping("/system-packages")
    public ResponseEntity<SystemPackage> createPackage(@RequestBody SystemPackage pkg) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.createSystemPackage(pkg));
    }

    @PutMapping("/system-packages/{id}")
    public ResponseEntity<SystemPackage> updatePackage(@PathVariable("id") UUID id, @RequestBody SystemPackage pkg) {
        return ResponseEntity.ok(subscriptionService.updateSystemPackage(id, pkg));
    }

    @DeleteMapping("/system-packages/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable("id") UUID id) {
        subscriptionService.deleteSystemPackage(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/partner-profile/me")
    public ResponseEntity<PartnerProfile> getMyProfile(@RequestHeader("x-owner-email") String email) {
        return ResponseEntity.ok(subscriptionService.getOrCreatePartnerProfile(email));
    }

    @GetMapping("/admin/partner-usages")
    public ResponseEntity<List<PartnerProfile>> getPartnerUsages() {
        return ResponseEntity.ok(subscriptionService.getPartnerUsages());
    }

    @GetMapping("/admin/users-list")
    public ResponseEntity<List<Map<String, Object>>> getUsersList() {
        // Mock list of platform users mapping role types as defined in server.ts
        List<PartnerProfile> partners = subscriptionService.getPartnerUsages();
        List<Map<String, Object>> list = partners.stream().map(p -> (Map<String, Object>) Map.<String, Object>of(
                "email", p.getEmail(),
                "role", "Hotel Owner",
                "plan", p.getPlan(),
                "verified", true,
                "totalBookings", p.getTotalBookings(),
                "totalHotels", p.getTotalHotels()
        )).toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/bulk-message")
    public ResponseEntity<?> sendBulkMessage(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("success", true, "count", 0, "message", "Bulk message logged"));
    }

    @PostMapping("/admin/send-partner-message")
    public ResponseEntity<?> sendPartnerMessage(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("success", true, "message", "Message sent successfully"));
    }
}
