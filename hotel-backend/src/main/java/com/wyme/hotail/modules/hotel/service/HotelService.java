package com.wyme.hotail.modules.hotel.service;

import com.wyme.hotail.core.exception.ResourceNotFoundException;
import com.wyme.hotail.core.security.TenantContext;
import com.wyme.hotail.modules.hotel.entity.HotelProfile;
import com.wyme.hotail.modules.hotel.entity.Room;
import com.wyme.hotail.modules.hotel.entity.StaffMember;
import com.wyme.hotail.modules.hotel.repository.HotelRepository;
import com.wyme.hotail.modules.hotel.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    public HotelService(HotelRepository hotelRepository, RoomRepository roomRepository) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
    }

    public List<HotelProfile> getAllHotels() {
        String tenantId = TenantContext.getCurrentTenant();
        return hotelRepository.findAllByTenantId(tenantId);
    }

    public HotelProfile getHotelById(UUID id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));
    }

    public List<HotelProfile> getMyAccessibleHotels(String ownerEmail) {
        return hotelRepository.findAccessibleHotels(ownerEmail);
    }

    public HotelProfile getOrCreateHotelProfile(String ownerEmail, String hotelName, String city, String phone) {
        String tenantId = TenantContext.getCurrentTenant();
        return hotelRepository.findByOwnerAndTenantId(ownerEmail, tenantId)
                .orElseGet(() -> {
                    HotelProfile newProfile = new HotelProfile();
                    newProfile.setOwner(ownerEmail);
                    newProfile.setPropertyName(hotelName != null ? hotelName : "");
                    newProfile.setCity(city != null ? city : "");
                    newProfile.setAddress(city != null ? city + ", Sri Lanka" : "");
                    newProfile.setPhone(phone != null ? phone : "");
                    newProfile.setEmail(ownerEmail);
                    newProfile.setTenantId(tenantId);
                    return hotelRepository.save(newProfile);
                });
    }

    public HotelProfile saveHotelProfile(HotelProfile hotelProfile) {
        hotelProfile.setTenantId(TenantContext.getCurrentTenant());
        return hotelRepository.save(hotelProfile);
    }

    public HotelProfile updateHotelProfile(HotelProfile updated) {
        String tenantId = TenantContext.getCurrentTenant();
        HotelProfile existing = hotelRepository.findByOwnerAndTenantId(updated.getOwner(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel profile not found for owner: " + updated.getOwner()));
        
        existing.setPropertyName(updated.getPropertyName());
        existing.setPropertyType(updated.getPropertyType());
        existing.setDescription(updated.getDescription());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setProvince(updated.getProvince());
        existing.setPhone(updated.getPhone());
        existing.setWhatsapp(updated.getWhatsapp());
        existing.setDirectionsLink(updated.getDirectionsLink());
        existing.setEmail(updated.getEmail());
        existing.setImageUrl(updated.getImageUrl());
        existing.setStars(updated.getStars());
        existing.setServiceCharge(updated.getServiceCharge());
        existing.setTaxPercentage(updated.getTaxPercentage());
        existing.setAmenities(updated.getAmenities());
        existing.setRules(updated.getRules());
        existing.setPolicies(updated.getPolicies());
        existing.setImages(updated.getImages());
        existing.setAreaInfo(updated.getAreaInfo());
        return hotelRepository.save(existing);
    }

    public HotelProfile staffLogin(String email, String password) {
        HotelProfile hotel = hotelRepository.findByStaffCredentials(email, password)
                .orElseThrow(() -> new IllegalArgumentException("Invalid staff credentials"));

        // Refresh/Grant premium subscription for 1 year
        hotel.setSubscription("Premium");
        hotel.setSubscriptionExpires(LocalDateTime.now().plusYears(1));
        return hotelRepository.save(hotel);
    }

    public void deleteHotel(UUID hotelId, String ownerEmail) {
        String tenantId = TenantContext.getCurrentTenant();
        HotelProfile hotel = hotelRepository.findByIdAndTenantId(hotelId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        if (!hotel.getOwner().equalsIgnoreCase(ownerEmail)) {
            throw new IllegalArgumentException("Forbidden: Only owner can delete this hotel");
        }

        // Cascading deletes
        List<Room> rooms = roomRepository.findAllByHotelIdAndTenantId(hotelId.toString(), tenantId);
        roomRepository.deleteAll(rooms);
        hotelRepository.delete(hotel);
    }

    // --- Rooms ---
    public List<Room> getRooms(String hotelId, String owner) {
        String tenantId = TenantContext.getCurrentTenant();
        if (hotelId != null && !hotelId.isEmpty()) {
            return roomRepository.findAllByHotelIdAndTenantId(hotelId, tenantId);
        } else if (owner != null && !owner.isEmpty()) {
            return roomRepository.findAllByOwnerAndTenantId(owner, tenantId);
        }
        return roomRepository.findAllByTenantId(tenantId);
    }

    public Room saveRoom(Room room) {
        room.setTenantId(TenantContext.getCurrentTenant());
        return roomRepository.save(room);
    }

    public Room updateRoom(UUID id, Room updated) {
        String tenantId = TenantContext.getCurrentTenant();
        Room existing = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        
        existing.setName(updated.getName());
        existing.setCapacity(updated.getCapacity());
        existing.setPrice(updated.getPrice());
        existing.setQty(updated.getQty());
        existing.setStatus(updated.getStatus());
        existing.setImageUrl(updated.getImageUrl());
        existing.setAmenities(updated.getAmenities());
        existing.setMealTypes(updated.getMealTypes());
        existing.setUnavailableDates(updated.getUnavailableDates());
        existing.setImages(updated.getImages());
        return roomRepository.save(existing);
    }

    public void deleteRoom(UUID id) {
        roomRepository.deleteById(id);
    }
}
