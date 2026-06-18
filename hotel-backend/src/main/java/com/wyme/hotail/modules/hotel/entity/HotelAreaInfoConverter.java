package com.wyme.hotail.modules.hotel.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class HotelAreaInfoConverter implements AttributeConverter<HotelAreaInfo, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(HotelAreaInfo attribute) {
        if (attribute == null) return null;
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @Override
    public HotelAreaInfo convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return new HotelAreaInfo(); // Return empty container instead of null to prevent NPEs in frontend
        }
        try {
            return objectMapper.readValue(dbData, HotelAreaInfo.class);
        } catch (JsonProcessingException e) {
            return new HotelAreaInfo();
        }
    }
}
