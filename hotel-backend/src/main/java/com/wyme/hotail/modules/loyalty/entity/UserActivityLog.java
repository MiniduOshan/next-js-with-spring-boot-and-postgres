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
@Table(name = "user_activity_logs")
public class UserActivityLog extends BaseEntity {

    @JsonProperty("user_id")
    @Column(name = "user_id", nullable = false)
    private String userId;

    @JsonProperty("activity_id")
    @Column(name = "activity_id", nullable = false)
    private String activityId;

    @JsonProperty("points_awarded")
    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded;

    @JsonProperty("reference_id")
    @Column(name = "reference_id")
    private String referenceId = "";

    @JsonProperty("remarks")
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks = "";

    @JsonProperty("awarded_by")
    @Column(name = "awarded_by")
    private String awardedBy = "system";

    @JsonProperty("awarded_at")
    public java.time.LocalDateTime getAwardedAt() {
        return getCreatedAt();
    }
}
