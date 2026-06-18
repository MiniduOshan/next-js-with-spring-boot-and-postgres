package com.wyme.hotail.modules.hotel.entity;

import com.wyme.hotail.shared.kernel.BaseEntity;
import com.wyme.hotail.shared.kernel.TenantSupport;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "hotel_profiles")
public class HotelProfile extends BaseEntity implements TenantSupport {

    @Column(name = "property_name")
    private String propertyName = "";

    @Column(name = "property_type")
    private String propertyType = "Hotel";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description = "";

    @Column(name = "address", columnDefinition = "TEXT")
    private String address = "";

    @Column(name = "city")
    private String city = "";

    @Column(name = "province")
    private String province = "";

    @Column(name = "phone")
    private String phone = "";

    @Column(name = "whatsapp")
    private String whatsapp = "";

    @Column(name = "directions_link", columnDefinition = "TEXT")
    private String directionsLink = "";

    @Column(name = "email")
    private String email = "";

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl = "";

    @Column(name = "owner")
    private String owner = "";

    @Column(name = "verified")
    private Boolean verified = false;

    @Column(name = "stars")
    private Integer stars = 0;

    @Column(name = "service_charge")
    private Double serviceCharge = 0.0;

    @Column(name = "tax_percentage")
    private Double taxPercentage = 0.0;

    @Column(name = "rating")
    private Double rating = 0.0;

    @Column(name = "price")
    private Double price = 0.0;

    @Column(name = "subscription")
    private String subscription = "Free";

    @Column(name = "subscription_expires")
    private LocalDateTime subscriptionExpires;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId = "default";

    @OneToMany(mappedBy = "hotelProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StaffMember> staff = new ArrayList<>();

    @OneToMany(mappedBy = "hotelProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HotelPackage> packages = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "hotel_amenities", joinColumns = @JoinColumn(name = "hotel_profile_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "hotel_rules", joinColumns = @JoinColumn(name = "hotel_profile_id"))
    @Column(name = "rule")
    private List<String> rules = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "hotel_policies", joinColumns = @JoinColumn(name = "hotel_profile_id"))
    @Column(name = "policy")
    private List<String> policies = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "hotel_images", joinColumns = @JoinColumn(name = "hotel_profile_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Convert(converter = HotelAreaInfoConverter.class)
    @Column(name = "area_info", columnDefinition = "TEXT")
    private HotelAreaInfo areaInfo;
}
