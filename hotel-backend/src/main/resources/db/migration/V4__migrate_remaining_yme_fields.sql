-- Add missing room details from HotelsYME
ALTER TABLE rooms ADD COLUMN size VARCHAR(255) DEFAULT '';
ALTER TABLE rooms ADD COLUMN bed_type VARCHAR(255) DEFAULT '';

-- Add missing booking fields
ALTER TABLE bookings ADD COLUMN discount_offered VARCHAR(255) DEFAULT '';

-- Create hotel meals table
CREATE TABLE hotel_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_profile_id UUID NOT NULL,
    meal_name VARCHAR(255) NOT NULL,
    category VARCHAR(255) DEFAULT '',
    price DOUBLE PRECISION NOT NULL,
    FOREIGN KEY (hotel_profile_id) REFERENCES hotel_profiles(id) ON DELETE CASCADE
);
