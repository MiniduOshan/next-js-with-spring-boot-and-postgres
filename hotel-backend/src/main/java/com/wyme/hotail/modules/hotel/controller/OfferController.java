package com.wyme.hotail.modules.hotel.controller;

import com.wyme.hotail.core.exception.ResourceNotFoundException;
import com.wyme.hotail.core.security.TenantContext;
import com.wyme.hotail.modules.hotel.entity.Offer;
import com.wyme.hotail.modules.hotel.repository.OfferRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class OfferController {

    private final OfferRepository offerRepository;

    public OfferController(OfferRepository offerRepository) {
        this.offerRepository = offerRepository;
    }

    @GetMapping("/public-offers")
    public ResponseEntity<List<Offer>> getPublicOffers() {
        return ResponseEntity.ok(offerRepository.findAllByActiveOrderByIdDesc(true));
    }

    @GetMapping("/offers")
    public ResponseEntity<List<Offer>> getOffers(
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId,
            @RequestHeader(value = "x-owner-email", required = false) String owner) {
        String tenantId = TenantContext.getCurrentTenant();
        if (hotelId != null && !hotelId.isEmpty()) {
            return ResponseEntity.ok(offerRepository.findAllByHotelIdAndTenantId(hotelId, tenantId));
        } else if (owner != null && !owner.isEmpty()) {
            return ResponseEntity.ok(offerRepository.findAllByOwnerAndTenantId(owner, tenantId));
        }
        return ResponseEntity.ok(offerRepository.findAllByTenantId(tenantId));
    }

    @PostMapping("/offers")
    public ResponseEntity<Offer> createOffer(
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId,
            @RequestHeader(value = "x-owner-email", required = false) String owner,
            @RequestBody Offer offer) {
        offer.setHotelId(hotelId != null ? hotelId : "");
        offer.setOwner(owner != null ? owner : "");
        offer.setTenantId(TenantContext.getCurrentTenant());
        return ResponseEntity.status(HttpStatus.CREATED).body(offerRepository.save(offer));
    }

    @PutMapping("/offers/{id}")
    public ResponseEntity<Offer> updateOffer(@PathVariable("id") UUID id, @RequestBody Offer updated) {
        Offer existing = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));
        existing.setTitle(updated.getTitle());
        existing.setDiscount(updated.getDiscount());
        existing.setActive(updated.getActive());
        existing.setEnds(updated.getEnds());
        existing.setImageUrl(updated.getImageUrl());
        return ResponseEntity.ok(offerRepository.save(existing));
    }

    @DeleteMapping("/offers/{id}")
    public ResponseEntity<?> deleteOffer(@PathVariable("id") UUID id) {
        offerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
