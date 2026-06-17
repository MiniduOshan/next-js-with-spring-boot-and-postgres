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
@Table(name = "user_points_summaries")
public class UserPointsSummary extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(name = "total_points")
    private Integer totalPoints = 0;

    @Column(name = "available_points")
    private Integer availablePoints = 0;

    @Column(name = "redeemed_points")
    private Integer redeemedPoints = 0;

    @Column(name = "expired_points")
    private Integer expiredPoints = 0;
}
