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
@Table(name = "user_points_summaries")
public class UserPointsSummary extends BaseEntity {

    @JsonProperty("user_id")
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @JsonProperty("total_points")
    @Column(name = "total_points")
    private Integer totalPoints = 0;

    @JsonProperty("available_points")
    @Column(name = "available_points")
    private Integer availablePoints = 0;

    @JsonProperty("redeemed_points")
    @Column(name = "redeemed_points")
    private Integer redeemedPoints = 0;

    @JsonProperty("expired_points")
    @Column(name = "expired_points")
    private Integer expiredPoints = 0;
}
