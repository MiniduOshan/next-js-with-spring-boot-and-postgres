package com.wyme.hotail.modules.subscription.entity;

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
@Table(name = "partner_profiles")
public class PartnerProfile extends BaseEntity implements TenantSupport {

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "plan")
    private String plan = "Free";

    @Column(name = "total_bookings")
    private Integer totalBookings = 0;

    @Column(name = "total_hotels")
    private Integer totalHotels = 0;

    @Column(name = "upgrade_email_sent")
    private Boolean upgradeEmailSent = true;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId = "default";
}
