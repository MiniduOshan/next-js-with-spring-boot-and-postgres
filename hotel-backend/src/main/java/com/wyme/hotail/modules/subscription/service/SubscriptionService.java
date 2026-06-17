package com.wyme.hotail.modules.subscription.service;

import com.wyme.hotail.core.security.TenantContext;
import com.wyme.hotail.modules.hotel.repository.HotelRepository;
import com.wyme.hotail.modules.booking.repository.BookingRepository;
import com.wyme.hotail.modules.subscription.entity.PartnerProfile;
import com.wyme.hotail.modules.subscription.entity.SystemPackage;
import com.wyme.hotail.modules.subscription.repository.PartnerProfileRepository;
import com.wyme.hotail.modules.subscription.repository.SystemPackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SubscriptionService {

    private final PartnerProfileRepository partnerProfileRepository;
    private final SystemPackageRepository systemPackageRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;

    public SubscriptionService(
            PartnerProfileRepository partnerProfileRepository,
            SystemPackageRepository systemPackageRepository,
            HotelRepository hotelRepository,
            BookingRepository bookingRepository) {
        this.partnerProfileRepository = partnerProfileRepository;
        this.systemPackageRepository = systemPackageRepository;
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
    }

    public PartnerProfile getOrCreatePartnerProfile(String email) {
        String tenantId = TenantContext.getCurrentTenant();
        return partnerProfileRepository.findByEmailAndTenantId(email, tenantId)
                .orElseGet(() -> {
                    long hotelsCount = hotelRepository.findAccessibleHotels(email).size();
                    
                    PartnerProfile profile = new PartnerProfile();
                    profile.setEmail(email);
                    profile.setPlan("Free");
                    profile.setTotalHotels((int) hotelsCount);
                    profile.setTotalBookings(0);
                    profile.setTenantId(tenantId);
                    return partnerProfileRepository.save(profile);
                });
    }

    public List<SystemPackage> getSystemPackages() {
        return systemPackageRepository.findAll();
    }

    public SystemPackage createSystemPackage(SystemPackage pkg) {
        return systemPackageRepository.save(pkg);
    }

    public SystemPackage updateSystemPackage(UUID id, SystemPackage updated) {
        SystemPackage existing = systemPackageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));
        existing.setName(updated.getName());
        existing.setPrice(updated.getPrice());
        existing.setHotels(updated.getHotels());
        existing.setStatus(updated.getStatus());
        existing.setFeatures(updated.getFeatures());
        return systemPackageRepository.save(existing);
    }

    public void deleteSystemPackage(UUID id) {
        systemPackageRepository.deleteById(id);
    }

    public List<PartnerProfile> getPartnerUsages() {
        return partnerProfileRepository.findAll();
    }
}
