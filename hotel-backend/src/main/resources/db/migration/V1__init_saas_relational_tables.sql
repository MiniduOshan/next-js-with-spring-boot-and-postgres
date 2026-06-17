-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- System Packages
CREATE TABLE system_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    price VARCHAR(255) NOT NULL,
    hotels VARCHAR(255) DEFAULT '1',
    status VARCHAR(255) DEFAULT 'Active'
);

CREATE TABLE system_package_features (
    system_package_id UUID NOT NULL,
    feature VARCHAR(255) NOT NULL,
    FOREIGN KEY (system_package_id) REFERENCES system_packages(id) ON DELETE CASCADE
);

-- Partner Profiles
CREATE TABLE partner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    plan VARCHAR(255) DEFAULT 'Free',
    total_bookings INTEGER DEFAULT 0,
    total_hotels INTEGER DEFAULT 0,
    upgrade_email_sent BOOLEAN DEFAULT TRUE,
    tenant_id VARCHAR(255) NOT NULL
);

-- Hotel Profiles
CREATE TABLE hotel_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_name VARCHAR(255) DEFAULT '',
    property_type VARCHAR(255) DEFAULT 'Hotel',
    description TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city VARCHAR(255) DEFAULT '',
    province VARCHAR(255) DEFAULT '',
    phone VARCHAR(255) DEFAULT '',
    whatsapp VARCHAR(255) DEFAULT '',
    directions_link TEXT DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    image_url TEXT DEFAULT '',
    owner VARCHAR(255) DEFAULT '',
    verified BOOLEAN DEFAULT FALSE,
    stars INTEGER DEFAULT 0,
    service_charge DOUBLE PRECISION DEFAULT 0.0,
    tax_percentage DOUBLE PRECISION DEFAULT 0.0,
    rating DOUBLE PRECISION DEFAULT 0.0,
    price DOUBLE PRECISION DEFAULT 0.0,
    subscription VARCHAR(255) DEFAULT 'Free',
    subscription_expires TIMESTAMP,
    tenant_id VARCHAR(255) NOT NULL
);

-- Hotel Staff Table
CREATE TABLE hotel_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_profile_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    name VARCHAR(255) DEFAULT '',
    password VARCHAR(255) DEFAULT '',
    FOREIGN KEY (hotel_profile_id) REFERENCES hotel_profiles(id) ON DELETE CASCADE
);

-- Hotel Packages Table
CREATE TABLE hotel_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_profile_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    price DOUBLE PRECISION NOT NULL,
    FOREIGN KEY (hotel_profile_id) REFERENCES hotel_profiles(id) ON DELETE CASCADE
);

CREATE TABLE hotel_package_features (
    hotel_package_id UUID NOT NULL,
    feature VARCHAR(255) NOT NULL,
    FOREIGN KEY (hotel_package_id) REFERENCES hotel_packages(id) ON DELETE CASCADE
);

-- Hotel Amenities
CREATE TABLE hotel_amenities (
    hotel_profile_id UUID NOT NULL,
    amenity VARCHAR(255) NOT NULL,
    FOREIGN KEY (hotel_profile_id) REFERENCES hotel_profiles(id) ON DELETE CASCADE
);

-- Hotel Rules
CREATE TABLE hotel_rules (
    hotel_profile_id UUID NOT NULL,
    rule VARCHAR(255) NOT NULL,
    FOREIGN KEY (hotel_profile_id) REFERENCES hotel_profiles(id) ON DELETE CASCADE
);

-- Hotel Policies
CREATE TABLE hotel_policies (
    hotel_profile_id UUID NOT NULL,
    policy VARCHAR(255) NOT NULL,
    FOREIGN KEY (hotel_profile_id) REFERENCES hotel_profiles(id) ON DELETE CASCADE
);

-- Hotel Images
CREATE TABLE hotel_images (
    hotel_profile_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (hotel_profile_id) REFERENCES hotel_profiles(id) ON DELETE CASCADE
);

-- Rooms Table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    qty INTEGER NOT NULL,
    status VARCHAR(255) DEFAULT 'Active',
    image_url TEXT DEFAULT '',
    owner VARCHAR(255) DEFAULT '',
    hotel_id VARCHAR(255) DEFAULT '',
    service_charge DOUBLE PRECISION DEFAULT 0.0,
    tax_percentage DOUBLE PRECISION DEFAULT 0.0,
    best_price DOUBLE PRECISION DEFAULT 0.0,
    version BIGINT DEFAULT 0,
    tenant_id VARCHAR(255) NOT NULL
);

-- Room Amenities
CREATE TABLE room_amenities (
    room_id UUID NOT NULL,
    amenity VARCHAR(255) NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Room Meal Types
CREATE TABLE room_meal_types (
    room_id UUID NOT NULL,
    meal_type VARCHAR(255) NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Room Unavailable Dates
CREATE TABLE room_unavailable_dates (
    room_id UUID NOT NULL,
    unavailable_date VARCHAR(255) NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Room Images
CREATE TABLE room_images (
    room_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP NOT NULL,
    status VARCHAR(255) DEFAULT 'Pending',
    amount VARCHAR(255),
    service_charge DOUBLE PRECISION DEFAULT 0.0,
    tax_amount DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner VARCHAR(255) DEFAULT '',
    hotel_id VARCHAR(255) DEFAULT '',
    commission_percentage DOUBLE PRECISION DEFAULT 0.0,
    commission_amount DOUBLE PRECISION DEFAULT 0.0,
    tenant_id VARCHAR(255) NOT NULL
);

-- Booking Items
CREATE TABLE booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Offers Table
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    discount VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    ends VARCHAR(255) DEFAULT 'Ongoing',
    applies_to VARCHAR(255) DEFAULT 'everything',
    owner VARCHAR(255) DEFAULT '',
    hotel_id VARCHAR(255) DEFAULT '',
    image_url TEXT DEFAULT '',
    tenant_id VARCHAR(255) NOT NULL
);

-- Offer Room Types
CREATE TABLE offer_room_types (
    offer_id UUID NOT NULL,
    room_type VARCHAR(255) NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);

-- Offer Package Types
CREATE TABLE offer_package_types (
    offer_id UUID NOT NULL,
    package_type VARCHAR(255) NOT NULL,
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest VARCHAR(255) NOT NULL,
    room VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    date VARCHAR(255) DEFAULT 'Just now',
    text TEXT NOT NULL,
    reply TEXT,
    owner VARCHAR(255) DEFAULT '',
    hotel_id VARCHAR(255) DEFAULT '',
    tenant_id VARCHAR(255) NOT NULL
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(255) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_id VARCHAR(255) DEFAULT '',
    tenant_id VARCHAR(255) NOT NULL
);

-- Loyalty Activities
CREATE TABLE loyalty_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_code VARCHAR(255) NOT NULL UNIQUE,
    activity_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    points INTEGER NOT NULL,
    activity_type VARCHAR(255) DEFAULT 'automatic',
    is_repeatable BOOLEAN DEFAULT TRUE,
    daily_limit INTEGER DEFAULT 0,
    weekly_limit INTEGER DEFAULT 0,
    monthly_limit INTEGER DEFAULT 0,
    lifetime_limit INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT FALSE,
    status VARCHAR(255) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Activity Logs
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    activity_id VARCHAR(255) NOT NULL,
    points_awarded INTEGER NOT NULL,
    reference_id VARCHAR(255) DEFAULT '',
    remarks TEXT DEFAULT '',
    awarded_by VARCHAR(255) DEFAULT 'system',
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Points Summaries
CREATE TABLE user_points_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    redeemed_points INTEGER DEFAULT 0,
    expired_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bid Requests
CREATE TABLE bid_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    budget VARCHAR(255) NOT NULL,
    requirements TEXT NOT NULL,
    status VARCHAR(255) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bid Offers
CREATE TABLE bid_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL,
    hotel_id VARCHAR(255) NOT NULL,
    hotel_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    offer_details TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    status VARCHAR(255) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES bid_requests(id) ON DELETE CASCADE
);

-- Bid Messages
CREATE TABLE bid_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_offer_id UUID NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bid_offer_id) REFERENCES bid_offers(id) ON DELETE CASCADE
);

-- News Updates
CREATE TABLE news_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(255) DEFAULT 'Published',
    author VARCHAR(255) DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
