package com.wyme.hotail.modules.subscription.entity;

import com.wyme.hotail.shared.kernel.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "system_packages")
public class SystemPackage extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "price", nullable = false)
    private String price;

    @Column(name = "hotels")
    private String hotels = "1";

    @Column(name = "status")
    private String status = "Active";

    @ElementCollection
    @CollectionTable(name = "system_package_features", joinColumns = @JoinColumn(name = "system_package_id"))
    @Column(name = "feature")
    private List<String> features = new ArrayList<>();
}
