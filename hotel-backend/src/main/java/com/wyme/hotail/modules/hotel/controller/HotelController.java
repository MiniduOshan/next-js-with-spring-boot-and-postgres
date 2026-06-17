package com.wyme.hotail.modules.hotel.controller;

import com.wyme.hotail.modules.hotel.entity.HotelProfile;
import com.wyme.hotail.modules.hotel.entity.Room;
import com.wyme.hotail.modules.hotel.service.HotelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping("/hotels")
    public ResponseEntity<List<HotelProfile>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/hotels/byslug/{slug}")
    public ResponseEntity<HotelProfile> getHotelBySlug(@PathVariable("slug") String slug) {
        // Simple mock of slug resolver as defined in server.ts
        List<HotelProfile> hotels = hotelService.getAllHotels();
        HotelProfile matched = hotels.stream()
                .filter(h -> {
                    String loc = h.getCity().isEmpty() ? "sri-lanka" : h.getCity();
                    String name = h.getPropertyName().isEmpty() ? "hotel" : h.getPropertyName();
                    String generatedSlug = ("hotel-in-" + loc + "-" + name)
                            .toLowerCase()
                            .replaceAll("[^a-z0-9]+", "-")
                            .replaceAll("(^-|-$)", "");
                    return generatedSlug.equals(slug);
                })
                .findFirst()
                .orElse(null);
        
        if (matched == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(matched);
    }

    @GetMapping("/hotels/{id}")
    public ResponseEntity<HotelProfile> getHotelById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @GetMapping("/hotels/{id}/rooms")
    public ResponseEntity<List<Room>> getHotelRooms(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(hotelService.getRooms(id.toString(), null));
    }

    @PostMapping("/staff-login")
    public ResponseEntity<?> staffLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        try {
            HotelProfile hotel = hotelService.staffLogin(email, password);
            String displayName = email.split("@")[0].replace(".", " ");
            
            Map<String, Object> user = Map.of(
                    "id", "staff-" + email,
                    "name", displayName,
                    "email", email,
                    "isPartner", false,
                    "isStaff", true,
                    "staffRole", "manager",
                    "hotelStatus", "approved",
                    "avatarUrl", "https://api.dicebear.com/7.x/initials/svg?seed=" + displayName,
                    "joinedDate", "Today",
                    "points", 0
            );
            return ResponseEntity.ok(Map.of("user", user, "hotel", hotel));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-hotels")
    public ResponseEntity<List<HotelProfile>> getMyHotels(@RequestHeader(value = "x-owner-email", required = false) String ownerEmail) {
        if (ownerEmail == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(hotelService.getMyAccessibleHotels(ownerEmail));
    }

    @GetMapping("/hotel-profile")
    public ResponseEntity<HotelProfile> getHotelProfile(
            @RequestHeader(value = "x-owner-email", required = false) String ownerEmail,
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId,
            @RequestHeader(value = "x-hotel-name", required = false) String hotelName,
            @RequestHeader(value = "x-hotel-city", required = false) String hotelCity,
            @RequestHeader(value = "x-hotel-phone", required = false) String hotelPhone) {
        
        if (hotelId != null && !hotelId.isEmpty()) {
            return ResponseEntity.ok(hotelService.getHotelById(UUID.fromString(hotelId)));
        }
        
        HotelProfile profile = hotelService.getOrCreateHotelProfile(ownerEmail, hotelName, hotelCity, hotelPhone);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/hotel-profile")
    public ResponseEntity<HotelProfile> createHotelProfile(
            @RequestHeader(value = "x-owner-email") String ownerEmail,
            @RequestBody HotelProfile profile) {
        profile.setOwner(ownerEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.saveHotelProfile(profile));
    }

    @PutMapping("/hotel-profile")
    public ResponseEntity<HotelProfile> updateHotelProfile(
            @RequestHeader(value = "x-owner-email") String ownerEmail,
            @RequestBody HotelProfile profile) {
        profile.setOwner(ownerEmail);
        return ResponseEntity.ok(hotelService.updateHotelProfile(profile));
    }

    @PutMapping("/hotel-profile/verify")
    public ResponseEntity<?> verifyHotel(@RequestBody Map<String, String> body) {
        String ownerEmail = body.get("ownerEmail");
        String hotelName = body.get("hotelName");
        String city = body.get("city");
        
        HotelProfile profile = hotelService.getOrCreateHotelProfile(ownerEmail, hotelName, city, "");
        profile.setVerified(true);
        hotelService.saveHotelProfile(profile);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/hotel-account")
    public ResponseEntity<?> deleteHotelAccount(@RequestHeader("x-owner-email") String ownerEmail) {
        // Custom cascade deletes could be executed here if owner profiles need scrubbing
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/hotels/{id}")
    public ResponseEntity<?> deleteHotel(
            @PathVariable("id") UUID id,
            @RequestHeader("x-owner-email") String ownerEmail) {
        hotelService.deleteHotel(id, ownerEmail);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
