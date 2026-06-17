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
@Table(name = "rooms")
public class Room extends BaseEntity implements TenantSupport {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "qty", nullable = false)
    private Integer qty;

    @Column(name = "status")
    private String status = "Active";

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl = "";

    @Column(name = "owner")
    private String owner = "";

    @Column(name = "hotel_id")
    private String hotelId = "";

    @Column(name = "service_charge")
    private Double serviceCharge = 0.0;

    @Column(name = "tax_percentage")
    private Double taxPercentage = 0.0;

    @Column(name = "best_price")
    private Double bestPrice = 0.0;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId = "default";

    @ElementCollection
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_meal_types", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "meal_type")
    private List<String> mealTypes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_unavailable_dates", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "unavailable_date")
    private List<String> unavailableDates = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_images", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();
}
