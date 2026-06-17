package com.wyme.hotail.modules.bidding.service;

import com.wyme.hotail.core.exception.ResourceNotFoundException;
import com.wyme.hotail.modules.bidding.entity.BidMessage;
import com.wyme.hotail.modules.bidding.entity.BidOffer;
import com.wyme.hotail.modules.bidding.entity.BidRequest;
import com.wyme.hotail.modules.bidding.repository.BidMessageRepository;
import com.wyme.hotail.modules.bidding.repository.BidOfferRepository;
import com.wyme.hotail.modules.bidding.repository.BidRequestRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BiddingService {

    private final BidRequestRepository bidRequestRepository;
    private final BidOfferRepository bidOfferRepository;
    private final BidMessageRepository bidMessageRepository;
    private final ApplicationEventPublisher eventPublisher;

    public BiddingService(
            BidRequestRepository bidRequestRepository,
            BidOfferRepository bidOfferRepository,
            BidMessageRepository bidMessageRepository,
            ApplicationEventPublisher eventPublisher) {
        this.bidRequestRepository = bidRequestRepository;
        this.bidOfferRepository = bidOfferRepository;
        this.bidMessageRepository = bidMessageRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<BidRequest> getBidRequests(String userEmail, String status) {
        if (userEmail != null && !userEmail.isEmpty() && status != null && !status.isEmpty()) {
            return bidRequestRepository.findAllByUserEmailAndStatusOrderByCreatedAtDesc(userEmail, status);
        } else if (userEmail != null && !userEmail.isEmpty()) {
            return bidRequestRepository.findAllByUserEmailOrderByCreatedAtDesc(userEmail);
        } else if (status != null && !status.isEmpty()) {
            return bidRequestRepository.findAllByStatusOrderByCreatedAtDesc(status);
        }
        return bidRequestRepository.findAll();
    }

    public BidRequest createBidRequest(BidRequest request) {
        return bidRequestRepository.save(request);
    }

    public void deleteBidRequest(UUID requestId) {
        BidRequest request = bidRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid request not found"));
        bidRequestRepository.delete(request);
    }

    public List<BidOffer> getOffersForRequest(UUID requestId) {
        return bidOfferRepository.findAllByRequestIdOrderByCreatedAtDesc(requestId);
    }

    public BidOffer createBidOffer(UUID requestId, BidOffer offer) {
        BidRequest request = bidRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid request not found"));
        
        if (!request.getStatus().equalsIgnoreCase("Open")) {
            throw new IllegalArgumentException("Bid request is no longer open");
        }

        offer.setRequestId(requestId);
        BidOffer saved = bidOfferRepository.save(offer);

        eventPublisher.publishEvent(saved); // Publish event for notification trigger

        return saved;
    }

    public List<BidOffer> getPartnerOffers(String ownerEmail) {
        return bidOfferRepository.findAllByOwnerEmailOrderByCreatedAtDesc(ownerEmail);
    }

    public BidMessage addMessage(UUID offerId, BidMessage message) {
        BidOffer offer = bidOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid offer not found"));
        message.setBidOffer(offer);
        return bidMessageRepository.save(message);
    }

    @Transactional
    public BidOffer acceptOffer(UUID offerId) {
        BidOffer offer = bidOfferRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid offer not found"));

        BidRequest request = bidRequestRepository.findById(offer.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Bid request not found"));

        if (!request.getStatus().equalsIgnoreCase("Open")) {
            throw new IllegalArgumentException("Bid request is no longer open");
        }

        // Accept the selected offer
        offer.setStatus("Accepted");
        bidOfferRepository.save(offer);

        // Reject all other offers for this request
        List<BidOffer> otherOffers = bidOfferRepository.findAllByRequestIdOrderByCreatedAtDesc(request.getId());
        for (BidOffer o : otherOffers) {
            if (!o.getId().equals(offer.getId())) {
                o.setStatus("Rejected");
                bidOfferRepository.save(o);
            }
        }

        // Close the request
        request.setStatus("Accepted");
        bidRequestRepository.save(request);

        eventPublisher.publishEvent(offer); // Publish accept event

        return offer;
    }

    public void deleteOffer(UUID offerId) {
        bidOfferRepository.deleteById(offerId);
    }
}
