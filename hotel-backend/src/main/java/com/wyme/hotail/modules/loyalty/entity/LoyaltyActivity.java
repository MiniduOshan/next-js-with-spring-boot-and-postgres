package com.wyme.hotail.modules.loyalty.entity;

import com.wyme.hotail.shared.kernel.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "loyalty_activities")
public class LoyaltyActivity extends BaseEntity {

    @Column(name = "activity_code", nullable = false, unique = true)
    private String activityCode;

    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description = "";

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "activity_type")
    private String activityType = "automatic";

    @Column(name = "is_repeatable")
    private Boolean isRepeatable = true;

    @Column(name = "daily_limit")
    private Integer dailyLimit = 0;

    @Column(name = "weekly_limit")
    private Integer weeklyLimit = 0;

    @Column(name = "monthly_limit")
    private Integer monthlyLimit = 0;

    @Column(name = "lifetime_limit")
    private Integer lifetimeLimit = 0;

    @Column(name = "requires_approval")
    private Boolean requiresApproval = false;

    @Column(name = "status")
    private String status = "active";
}
