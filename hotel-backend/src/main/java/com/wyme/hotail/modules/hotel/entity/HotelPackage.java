package com.wyme.hotail.modules.hotel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.wyme.hotail.shared.kernel.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "hotel_packages")
public class HotelPackage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_profile_id", nullable = false)
    @JsonIgnore
    private HotelProfile hotelProfile;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description = "";

    @Column(name = "price", nullable = false)
    private Double price;

    @ElementCollection
    @CollectionTable(name = "hotel_package_features", joinColumns = @JoinColumn(name = "hotel_package_id"))
    @Column(name = "feature")
    private List<String> features = new ArrayList<>();
}
