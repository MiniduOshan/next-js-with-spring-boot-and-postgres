package com.wyme.hotail.modules.bidding.entity;

import com.wyme.hotail.shared.kernel.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "bid_offers")
public class BidOffer extends BaseEntity {

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(name = "hotel_id", nullable = false)
    private String hotelId;

    @Column(name = "hotel_name", nullable = false)
    private String hotelName;

    @Column(name = "owner_email", nullable = false)
    private String ownerEmail;

    @Column(name = "offer_details", columnDefinition = "TEXT", nullable = false)
    private String offerDetails;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "status")
    private String status = "Pending";

    @OneToMany(mappedBy = "bidOffer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BidMessage> messages = new ArrayList<>();
}
