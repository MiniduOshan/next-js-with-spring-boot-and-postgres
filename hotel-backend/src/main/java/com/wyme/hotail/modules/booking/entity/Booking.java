package com.wyme.hotail.modules.booking.entity;

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
@Table(name = "bookings")
public class Booking extends BaseEntity implements TenantSupport {

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    @Column(name = "guest_email", nullable = false)
    private String guestEmail;

    @Column(name = "check_in", nullable = false)
    private LocalDateTime checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDateTime checkOut;

    @Column(name = "status")
    private String status = "Pending";

    @Column(name = "amount")
    private String amount;

    @Column(name = "service_charge")
    private Double serviceCharge = 0.0;

    @Column(name = "tax_amount")
    private Double taxAmount = 0.0;

    @Column(name = "owner")
    private String owner = "";

    @Column(name = "hotel_id")
    private String hotelId = "";

    @Column(name = "commission_percentage")
    private Double commissionPercentage = 0.0;

    @Column(name = "commission_amount")
    private Double commissionAmount = 0.0;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId = "default";

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingItem> items = new ArrayList<>();
}
