package com.wyme.hotail.modules.bidding.controller;

import com.wyme.hotail.modules.bidding.entity.BidOffer;
import com.wyme.hotail.modules.bidding.entity.BidRequest;
import com.wyme.hotail.modules.bidding.service.BiddingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BidRequestController {

    private final BiddingService biddingService;

    public BidRequestController(BiddingService biddingService) {
        this.biddingService = biddingService;
    }

    @GetMapping("/bid-requests")
    public ResponseEntity<List<BidRequest>> getRequests(
            @RequestParam(value = "userEmail", required = false) String userEmail,
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(biddingService.getBidRequests(userEmail, status));
    }

    @GetMapping("/open-bid-requests")
    public ResponseEntity<List<BidRequest>> getOpenRequests() {
        return ResponseEntity.ok(biddingService.getBidRequests(null, "Open"));
    }

    @PostMapping("/bid-requests")
    public ResponseEntity<BidRequest> createRequest(@RequestBody BidRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(biddingService.createBidRequest(request));
    }

    @DeleteMapping("/bid-requests/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable("id") UUID id) {
        biddingService.deleteBidRequest(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/bid-requests/{id}/offers")
    public ResponseEntity<List<BidOffer>> getOffers(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(biddingService.getOffersForRequest(id));
    }

    @PostMapping("/bid-requests/{id}/offers")
    public ResponseEntity<BidOffer> createOffer(@PathVariable("id") UUID id, @RequestBody BidOffer offer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(biddingService.createBidOffer(id, offer));
    }
}
