package com.wyme.hotail.modules.notification.entity;

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
@Table(name = "notifications")
public class Notification extends BaseEntity implements TenantSupport {

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "type")
    private String type = "info";

    @Column(name = "read")
    private Boolean read = false;

    @Column(name = "related_id")
    private String relatedId = "";

    @Column(name = "tenant_id", nullable = false)
    private String tenantId = "default";
}
