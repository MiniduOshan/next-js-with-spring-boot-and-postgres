package com.wyme.hotail.modules.hotel.entity;

import com.wyme.hotail.shared.kernel.BaseEntity;
import com.wyme.hotail.shared.kernel.TenantSupport;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "reviews")
public class Review extends BaseEntity implements TenantSupport {

    @Column(name = "guest", nullable = false)
    private String guest;

    @Column(name = "room", nullable = false)
    private String room;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "date")
    private String date = "Just now";

    @Column(name = "text", columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(name = "reply", columnDefinition = "TEXT")
    private String reply;

    @Column(name = "owner")
    private String owner = "";

    @Column(name = "hotel_id")
    private String hotelId = "";

    @Column(name = "tenant_id", nullable = false)
    private String tenantId = "default";
}
