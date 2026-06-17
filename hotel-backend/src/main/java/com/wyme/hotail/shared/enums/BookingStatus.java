package com.wyme.hotail.shared.enums;

public enum BookingStatus {
    PENDING("Pending"),
    APPROVED("Approved"),
    CONFIRMED("Confirmed"),
    CANCELLED("Cancelled"),
    REJECTED("Rejected"),
    CHECKED_IN("Checked In"),
    CHECKED_OUT("Checked Out");

    private final String value;

    BookingStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static BookingStatus fromValue(String value) {
        for (BookingStatus status : BookingStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        return PENDING; // fallback
    }
}
