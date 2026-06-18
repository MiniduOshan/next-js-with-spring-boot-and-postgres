package com.wyme.hotail.modules.hotel.entity;

import lombok.Data;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class HotelAreaInfo implements Serializable {
    private List<AreaItem> nearbyPlaces = new ArrayList<>();
    private List<AreaItem> restaurants = new ArrayList<>();
    private List<AreaItem> naturalBeauty = new ArrayList<>();
    private List<AreaItem> publicTransit = new ArrayList<>();
    private List<AreaItem> airports = new ArrayList<>();

    @Data
    public static class AreaItem implements Serializable {
        private String name;
        private String distance;
    }
}
