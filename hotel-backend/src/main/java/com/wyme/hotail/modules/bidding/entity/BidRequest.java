package com.wyme.hotail.modules.bidding.entity;

import com.wyme.hotail.shared.kernel.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bid_requests")
public class BidRequest extends BaseEntity {

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "budget", nullable = false)
    private String budget;

    @Column(name = "requirements", columnDefinition = "TEXT", nullable = false)
    private String requirements;

    @Column(name = "status")
    private String status = "Open";
}
