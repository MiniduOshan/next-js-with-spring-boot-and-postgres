package com.wyme.hotail.modules.hotel.controller;

import com.wyme.hotail.core.exception.ResourceNotFoundException;
import com.wyme.hotail.core.security.TenantContext;
import com.wyme.hotail.modules.hotel.entity.Review;
import com.wyme.hotail.modules.hotel.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getReviews(
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId,
            @RequestHeader(value = "x-owner-email", required = false) String owner) {
        String tenantId = TenantContext.getCurrentTenant();
        if (hotelId != null && !hotelId.isEmpty()) {
            return ResponseEntity.ok(reviewRepository.findAllByHotelIdAndTenantId(hotelId, tenantId));
        } else if (owner != null && !owner.isEmpty()) {
            return ResponseEntity.ok(reviewRepository.findAllByOwnerAndTenantId(owner, tenantId));
        }
        return ResponseEntity.ok(reviewRepository.findAllByTenantId(tenantId));
    }

    @GetMapping("/hotels/{id}/reviews")
    public ResponseEntity<List<Review>> getHotelReviews(@PathVariable("id") UUID id) {
        String tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(reviewRepository.findAllByHotelIdAndTenantId(id.toString(), tenantId));
    }

    @PostMapping("/reviews")
    public ResponseEntity<Review> createReview(
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId,
            @RequestBody Review review) {
        review.setHotelId(hotelId != null ? hotelId : "");
        review.setTenantId(TenantContext.getCurrentTenant());
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewRepository.save(review));
    }

    @PutMapping("/reviews/{id}/reply")
    public ResponseEntity<Review> replyReview(@PathVariable("id") UUID id, @RequestBody Map<String, String> body) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setReply(body.get("reply"));
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable("id") UUID id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
