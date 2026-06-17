package com.wyme.hotail.modules.hotel.entity;

import com.wyme.hotail.shared.kernel.BaseEntity;
import com.wyme.hotail.shared.kernel.TenantSupport;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "offers")
public class Offer extends BaseEntity implements TenantSupport {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "discount", nullable = false)
    private String discount;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "ends")
    private String ends = "Ongoing";

    @Column(name = "applies_to")
    private String appliesTo = "everything";

    @Column(name = "owner")
    private String owner = "";

    @Column(name = "hotel_id")
    private String hotelId = "";

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl = "";

    @Column(name = "tenant_id", nullable = false)
    private String tenantId = "default";

    @ElementCollection
    @CollectionTable(name = "offer_room_types", joinColumns = @JoinColumn(name = "offer_id"))
    @Column(name = "room_type")
    private List<String> roomTypes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "offer_package_types", joinColumns = @JoinColumn(name = "offer_id"))
    @Column(name = "package_type")
    private List<String> packageTypes = new ArrayList<>();
}
