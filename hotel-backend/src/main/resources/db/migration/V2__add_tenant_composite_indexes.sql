-- Explicit composite indexes forcing fast tenant-scoped lookup executions
CREATE INDEX idx_bookings_tenant_date ON bookings(tenant_id, created_at DESC);
CREATE INDEX idx_rooms_tenant_hotel ON rooms(tenant_id, hotel_id);
CREATE INDEX idx_hotels_tenant_owner ON hotel_profiles(tenant_id, owner);
CREATE INDEX idx_offers_tenant_hotel ON offers(tenant_id, hotel_id);
CREATE INDEX idx_reviews_tenant_hotel ON reviews(tenant_id, hotel_id);
CREATE INDEX idx_notifications_tenant_recipient ON notifications(tenant_id, recipient_email);
