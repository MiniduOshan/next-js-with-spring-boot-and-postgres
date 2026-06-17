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
@Table(name = "user_activity_logs")
public class UserActivityLog extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "activity_id", nullable = false)
    private String activityId;

    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded;

    @Column(name = "reference_id")
    private String referenceId = "";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks = "";

    @Column(name = "awarded_by")
    private String awardedBy = "system";
}
