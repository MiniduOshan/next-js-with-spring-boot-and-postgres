package com.wyme.hotail.modules.loyalty.entity;

import com.wyme.hotail.shared.kernel.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@Entity
@Table(name = "loyalty_activities")
public class LoyaltyActivity extends BaseEntity {

    @JsonProperty("activity_code")
    @Column(name = "activity_code", nullable = false, unique = true)
    private String activityCode;

    @JsonProperty("activity_name")
    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @JsonProperty("description")
    @Column(name = "description", columnDefinition = "TEXT")
    private String description = "";

    @JsonProperty("points")
    @Column(name = "points", nullable = false)
    private Integer points;

    @JsonProperty("activity_type")
    @Column(name = "activity_type")
    private String activityType = "automatic";

    @JsonProperty("is_repeatable")
    @Column(name = "is_repeatable")
    private Boolean isRepeatable = true;

    @JsonProperty("daily_limit")
    @Column(name = "daily_limit")
    private Integer dailyLimit = 0;

    @JsonProperty("weekly_limit")
    @Column(name = "weekly_limit")
    private Integer weeklyLimit = 0;

    @JsonProperty("monthly_limit")
    @Column(name = "monthly_limit")
    private Integer monthlyLimit = 0;

    @JsonProperty("lifetime_limit")
    @Column(name = "lifetime_limit")
    private Integer lifetimeLimit = 0;

    @JsonProperty("requires_approval")
    @Column(name = "requires_approval")
    private Boolean requiresApproval = false;

    @JsonProperty("status")
    @Column(name = "status")
    private String status = "active";
}
