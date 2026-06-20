package com.wyme.hotail.core.constants;

public class SecurityConstants {
    public static final String[] PUBLIC_URLS = {
        "/api/auth/**",
        "/api/debug/**",
        "/api/public-offers",
        "/api/hotels",
        "/api/hotels/byslug/**",
        "/api/hotels/*/rooms",
        "/api/hotels/*/reviews",
        "/api/staff-login",
        "/api/bookings/check-availability",
        "/api/news",
        "/api/loyalty/activities",
        "/api/loyalty/leaderboard",
        "/api/open-bid-requests",
        "/api/bid-requests/**",
        "/api/bid-offers/**",
        "/api/partner-offers",
        "/ws/**"
    };

}
