package com.wyme.hotail.modules.bidding.controller;

import com.wyme.hotail.modules.bidding.entity.BidMessage;
import com.wyme.hotail.modules.bidding.entity.BidOffer;
import com.wyme.hotail.modules.bidding.service.BiddingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BidOfferController {

    private final BiddingService biddingService;

    public BidOfferController(BiddingService biddingService) {
        this.biddingService = biddingService;
    }

    @GetMapping("/partner-offers")
    public ResponseEntity<List<BidOffer>> getPartnerOffers(@RequestHeader("x-owner-email") String ownerEmail) {
        return ResponseEntity.ok(biddingService.getPartnerOffers(ownerEmail));
    }

    @PostMapping("/bid-offers/{offerId}/messages")
    public ResponseEntity<?> addMessage(
            @PathVariable("offerId") UUID offerId,
            @RequestBody BidMessage message) {
        biddingService.addMessage(offerId, message);
        return ResponseEntity.ok(Map.of("success", true, "message", "Message added"));
    }

    @PutMapping("/bid-offers/{offerId}/accept")
    public ResponseEntity<?> acceptOffer(@PathVariable("offerId") UUID offerId) {
        BidOffer offer = biddingService.acceptOffer(offerId);
        return ResponseEntity.ok(Map.of("success", true, "offer", offer));
    }

    @DeleteMapping("/bid-offers/{offerId}")
    public ResponseEntity<?> deleteOffer(@PathVariable("offerId") UUID offerId) {
        biddingService.deleteOffer(offerId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
