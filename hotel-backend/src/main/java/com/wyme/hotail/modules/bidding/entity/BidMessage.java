package com.wyme.hotail.modules.bidding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.wyme.hotail.shared.kernel.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bid_messages")
public class BidMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_offer_id", nullable = false)
    @JsonIgnore
    private BidOffer bidOffer;

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    @Column(name = "sender_name", nullable = false)
    private String senderName;

    @Column(name = "sender_role", nullable = false)
    private String senderRole;

    @Column(name = "text", columnDefinition = "TEXT", nullable = false)
    private String text;
}
