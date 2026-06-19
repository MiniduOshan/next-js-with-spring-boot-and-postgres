-- Seed Partner Profile for partner@yme.lk
INSERT INTO partner_profiles (id, email, plan, total_bookings, total_hotels, upgrade_email_sent, tenant_id)
VALUES ('99f8d8a2-2615-4ba3-81e0-ea21be550e50', 'partner@yme.lk', 'Premium', 12, 5, FALSE, 'partner@yme.lk')
ON CONFLICT (email) DO NOTHING;

-- Seed Hotel Profiles for both 'partner@yme.lk' and 'default' tenants

-- 1. MARINO BEACH COLOMBO (partner@yme.lk)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Marino Beach Colombo',
    'Hotel',
    'Experience world-class service at Marino Beach Colombo. Featuring an incredible rooftop infinity pool overlooking the ocean, fitness center, and multiple fine dining options.',
    'Colombo 03, Colombo',
    'Colombo',
    'Western',
    '+94 11 234 5678',
    '+94 77 123 4567',
    'https://maps.google.com/?q=Marino+Beach+Colombo',
    'marino@yme.lk',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    5,
    2500.0,
    15.0,
    9.3,
    45000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'partner@yme.lk',
    '{"nearbyPlaces":[{"name":"Colombo Fort","distance":"2.5 km"},{"name":"Galle Face Green","distance":"1.8 km"}],"restaurants":[{"name":"Tides Restaurant","distance":"Inside hotel"},{"name":"Nihonbashi","distance":"2.0 km"}],"naturalBeauty":[{"name":"Indian Ocean","distance":"0.1 km"}],"publicTransit":[{"name":"Kollupitiya Railway Station","distance":"0.5 km"}],"airports":[{"name":"Bandaranaike International Airport","distance":"33.0 km"}]}'
);

-- 1b. MARINO BEACH COLOMBO (default)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Marino Beach Colombo',
    'Hotel',
    'Experience world-class service at Marino Beach Colombo. Featuring an incredible rooftop infinity pool overlooking the ocean, fitness center, and multiple fine dining options.',
    'Colombo 03, Colombo',
    'Colombo',
    'Western',
    '+94 11 234 5678',
    '+94 77 123 4567',
    'https://maps.google.com/?q=Marino+Beach+Colombo',
    'marino@yme.lk',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    5,
    2500.0,
    15.0,
    9.3,
    45000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'default',
    '{"nearbyPlaces":[{"name":"Colombo Fort","distance":"2.5 km"},{"name":"Galle Face Green","distance":"1.8 km"}],"restaurants":[{"name":"Tides Restaurant","distance":"Inside hotel"},{"name":"Nihonbashi","distance":"2.0 km"}],"naturalBeauty":[{"name":"Indian Ocean","distance":"0.1 km"}],"publicTransit":[{"name":"Kollupitiya Railway Station","distance":"0.5 km"}],"airports":[{"name":"Bandaranaike International Airport","distance":"33.0 km"}]}'
);

-- 2. HERITANCE KANDALAMA (partner@yme.lk)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'Heritance Kandalama',
    'Resort',
    'Designed by the legendary architect Geoffrey Bawa, Heritance Kandalama is a unique eco-resort nestled amidst lush jungles and looking out over the scenic Kandalama Tank reservoir.',
    'Kandalama, Dambulla',
    'Dambulla',
    'Central',
    '+94 66 555 5555',
    '+94 77 123 4568',
    'https://maps.google.com/?q=Heritance+Kandalama',
    'kandalama@yme.lk',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    5,
    3000.0,
    15.0,
    9.5,
    85000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'partner@yme.lk',
    '{"nearbyPlaces":[{"name":"Dambulla Cave Temple","distance":"12.0 km"},{"name":"Sigiriya Rock","distance":"24.0 km"}],"restaurants":[{"name":"Kanchana Restaurant","distance":"Inside hotel"}],"naturalBeauty":[{"name":"Kandalama Lake","distance":"0.1 km"}],"publicTransit":[{"name":"Dambulla Bus Stand","distance":"10.0 km"}],"airports":[{"name":"Sigiriya Airport","distance":"15.0 km"}]}'
);

-- 2b. HERITANCE KANDALAMA (default)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'f2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'Heritance Kandalama',
    'Resort',
    'Designed by the legendary architect Geoffrey Bawa, Heritance Kandalama is a unique eco-resort nestled amidst lush jungles and looking out over the scenic Kandalama Tank reservoir.',
    'Kandalama, Dambulla',
    'Dambulla',
    'Central',
    '+94 66 555 5555',
    '+94 77 123 4568',
    'https://maps.google.com/?q=Heritance+Kandalama',
    'kandalama@yme.lk',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    5,
    3000.0,
    15.0,
    9.5,
    85000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'default',
    '{"nearbyPlaces":[{"name":"Dambulla Cave Temple","distance":"12.0 km"},{"name":"Sigiriya Rock","distance":"24.0 km"}],"restaurants":[{"name":"Kanchana Restaurant","distance":"Inside hotel"}],"naturalBeauty":[{"name":"Kandalama Lake","distance":"0.1 km"}],"publicTransit":[{"name":"Dambulla Bus Stand","distance":"10.0 km"}],"airports":[{"name":"Sigiriya Airport","distance":"15.0 km"}]}'
);

-- 3. 98 ACRES RESORT & SPA (partner@yme.lk)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    '98 Acres Resort & Spa',
    'Resort',
    'A scenic boutique retreat in Ella, surrounded by lush tea estates. 98 Acres Resort offers luxurious chalets made of wood, grass and thatch with exquisite panoramic views of the mountains.',
    'Passara Road, Ella',
    'Ella',
    'Uva',
    '+94 57 234 5678',
    '+94 77 123 4569',
    'https://maps.google.com/?q=98+Acres+Resort+and+Spa',
    '98acres@yme.lk',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    5,
    3500.0,
    15.0,
    9.6,
    95000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'partner@yme.lk',
    '{"nearbyPlaces":[{"name":"Little Adams Peak","distance":"0.5 km"},{"name":"Nine Arch Bridge","distance":"2.1 km"}],"restaurants":[{"name":"Restaurant 98","distance":"Inside hotel"}],"naturalBeauty":[{"name":"Ella Rock","distance":"5.0 km"}],"publicTransit":[{"name":"Ella Railway Station","distance":"2.0 km"}],"airports":[{"name":"Mattala Rajapaksa Airport","distance":"85.0 km"}]}'
);

-- 3b. 98 ACRES RESORT & SPA (default)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'f3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    '98 Acres Resort & Spa',
    'Resort',
    'A scenic boutique retreat in Ella, surrounded by lush tea estates. 98 Acres Resort offers luxurious chalets made of wood, grass and thatch with exquisite panoramic views of the mountains.',
    'Passara Road, Ella',
    'Ella',
    'Uva',
    '+94 57 234 5678',
    '+94 77 123 4569',
    'https://maps.google.com/?q=98+Acres+Resort+and+Spa',
    '98acres@yme.lk',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    5,
    3500.0,
    15.0,
    9.6,
    95000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'default',
    '{"nearbyPlaces":[{"name":"Little Adams Peak","distance":"0.5 km"},{"name":"Nine Arch Bridge","distance":"2.1 km"}],"restaurants":[{"name":"Restaurant 98","distance":"Inside hotel"}],"naturalBeauty":[{"name":"Ella Rock","distance":"5.0 km"}],"publicTransit":[{"name":"Ella Railway Station","distance":"2.0 km"}],"airports":[{"name":"Mattala Rajapaksa Airport","distance":"85.0 km"}]}'
);

-- 4. CINNAMON BENTOTA BEACH (partner@yme.lk)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    'Cinnamon Bentota Beach',
    'Resort',
    'A gorgeous beachfront resort blending Geoffrey Bawa architecture with contemporary art, situated on the golden beaches of Bentota with premium amenities and water sports options.',
    'Bentota Beach, Bentota',
    'Bentota',
    'Southern',
    '+94 34 234 5678',
    '+94 77 123 4570',
    'https://maps.google.com/?q=Cinnamon+Bentota+Beach',
    'bentota@yme.lk',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    5,
    2000.0,
    15.0,
    9.1,
    55000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'partner@yme.lk',
    '{"nearbyPlaces":[{"name":"Bentota Lake","distance":"1.0 km"}],"restaurants":[{"name":"Nossa Restaurant","distance":"Inside hotel"}],"naturalBeauty":[{"name":"Bentota Beach","distance":"0.1 km"}],"publicTransit":[{"name":"Bentota Railway Station","distance":"1.2 km"}],"airports":[{"name":"Bandaranaike International Airport","distance":"110.0 km"}]}'
);

-- 4b. CINNAMON BENTOTA BEACH (default)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'f4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    'Cinnamon Bentota Beach',
    'Resort',
    'A gorgeous beachfront resort blending Geoffrey Bawa architecture with contemporary art, situated on the golden beaches of Bentota with premium amenities and water sports options.',
    'Bentota Beach, Bentota',
    'Bentota',
    'Southern',
    '+94 34 234 5678',
    '+94 77 123 4570',
    'https://maps.google.com/?q=Cinnamon+Bentota+Beach',
    'bentota@yme.lk',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    5,
    2000.0,
    15.0,
    9.1,
    55000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'default',
    '{"nearbyPlaces":[{"name":"Bentota Lake","distance":"1.0 km"}],"restaurants":[{"name":"Nossa Restaurant","distance":"Inside hotel"}],"naturalBeauty":[{"name":"Bentota Beach","distance":"0.1 km"}],"publicTransit":[{"name":"Bentota Railway Station","distance":"1.2 km"}],"airports":[{"name":"Bandaranaike International Airport","distance":"110.0 km"}]}'
);

-- 5. GALLE FORT HOTEL (partner@yme.lk)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    'Galle Fort Hotel',
    'Hotel',
    'A beautifully restored 18th-century Dutch merchant house, Galle Fort Hotel offers a historical boutique atmosphere right in the heart of the UNESCO World Heritage Galle Fort.',
    'Church Street, Galle Fort',
    'Galle',
    'Southern',
    '+94 91 234 5678',
    '+94 77 123 4571',
    'https://maps.google.com/?q=Galle+Fort+Hotel',
    'gallefort@yme.lk',
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    4,
    1800.0,
    15.0,
    9.2,
    32000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'partner@yme.lk',
    '{"nearbyPlaces":[{"name":"Galle Lighthouse","distance":"0.4 km"},{"name":"Dutch Reformed Church","distance":"0.1 km"}],"restaurants":[{"name":"Fortaleza","distance":"0.3 km"}],"naturalBeauty":[{"name":"Indian Ocean","distance":"0.2 km"}],"publicTransit":[{"name":"Galle Railway Station","distance":"0.8 km"}],"airports":[{"name":"Bandaranaike International Airport","distance":"145.0 km"}]}'
);

-- 5b. GALLE FORT HOTEL (default)
INSERT INTO hotel_profiles (id, property_name, property_type, description, address, city, province, phone, whatsapp, directions_link, email, image_url, owner, verified, stars, service_charge, tax_percentage, rating, price, subscription, subscription_expires, tenant_id, area_info)
VALUES (
    'f5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    'Galle Fort Hotel',
    'Hotel',
    'A beautifully restored 18th-century Dutch merchant house, Galle Fort Hotel offers a historical boutique atmosphere right in the heart of the UNESCO World Heritage Galle Fort.',
    'Church Street, Galle Fort',
    'Galle',
    'Southern',
    '+94 91 234 5678',
    '+94 77 123 4571',
    'https://maps.google.com/?q=Galle+Fort+Hotel',
    'gallefort@yme.lk',
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'partner@yme.lk',
    TRUE,
    4,
    1800.0,
    15.0,
    9.2,
    32000.0,
    'Premium',
    '2030-12-31 23:59:59',
    'default',
    '{"nearbyPlaces":[{"name":"Galle Lighthouse","distance":"0.4 km"},{"name":"Dutch Reformed Church","distance":"0.1 km"}],"restaurants":[{"name":"Fortaleza","distance":"0.3 km"}],"naturalBeauty":[{"name":"Indian Ocean","distance":"0.2 km"}],"publicTransit":[{"name":"Galle Railway Station","distance":"0.8 km"}],"airports":[{"name":"Bandaranaike International Airport","distance":"145.0 km"}]}'
);


-- Seeding Amenities for both tenants
-- Marino Beach Colombo
INSERT INTO hotel_amenities (hotel_profile_id, amenity) VALUES 
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Swimming Pool'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Free WiFi'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Breakfast Included'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Air Conditioning'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Free Parking'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Spa'),
('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Swimming Pool'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Free WiFi'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Breakfast Included'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Air Conditioning'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Free Parking'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Spa');

-- Heritance Kandalama
INSERT INTO hotel_amenities (hotel_profile_id, amenity) VALUES 
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Swimming Pool'), ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Free WiFi'), ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Breakfast Included'), ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Air Conditioning'), ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Free Parking'), ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Spa'),
('f2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Swimming Pool'), ('f2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Free WiFi'), ('f2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Breakfast Included'), ('f2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Air Conditioning'), ('f2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Free Parking'), ('f2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Spa');

-- 98 Acres Resort
INSERT INTO hotel_amenities (hotel_profile_id, amenity) VALUES 
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Swimming Pool'), ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Free WiFi'), ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Breakfast Included'), ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Air Conditioning'), ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Spa'),
('f3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Swimming Pool'), ('f3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Free WiFi'), ('f3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Breakfast Included'), ('f3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Air Conditioning'), ('f3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Spa');

-- Cinnamon Bentota Beach
INSERT INTO hotel_amenities (hotel_profile_id, amenity) VALUES 
('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Swimming Pool'), ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Free WiFi'), ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Breakfast Included'), ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Air Conditioning'), ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Free Parking'), ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Beachfront'),
('f4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Swimming Pool'), ('f4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Free WiFi'), ('f4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Breakfast Included'), ('f4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Air Conditioning'), ('f4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Free Parking'), ('f4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Beachfront');

-- Galle Fort Hotel
INSERT INTO hotel_amenities (hotel_profile_id, amenity) VALUES 
('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Free WiFi'), ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Breakfast Included'), ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Air Conditioning'), ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Swimming Pool'),
('f5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Free WiFi'), ('f5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Breakfast Included'), ('f5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Air Conditioning'), ('f5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Swimming Pool');


-- Seeding Rules for both tenants
-- Marino Beach Colombo
INSERT INTO hotel_rules (hotel_profile_id, rule) VALUES 
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Check-in from 14:00 to 23:30'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Check-out from 06:00 to 12:00'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Pets are not allowed'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Smoking is prohibited in all rooms'),
('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Check-in from 14:00 to 23:30'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Check-out from 06:00 to 12:00'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Pets are not allowed'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Smoking is prohibited in all rooms');


-- Seeding Policies for both tenants
-- Marino Beach Colombo
INSERT INTO hotel_policies (hotel_profile_id, policy) VALUES 
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Free cancellation before 48 hours of check-in'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Payment taken at the property'), ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'All children are welcome. Cots available on request.'),
('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Free cancellation before 48 hours of check-in'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Payment taken at the property'), ('f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'All children are welcome. Cots available on request.');


-- Seeding Packages & Features
-- Marino Beach Colombo
INSERT INTO hotel_packages (id, hotel_profile_id, name, description, price) VALUES 
('5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Honeymoon Package', 'Romantic getaway with special amenities and ocean view.', 85000.0),
('6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Weekend Escape', 'Perfect short break with late checkout.', 55000.0),
('8a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Honeymoon Package', 'Romantic getaway with special amenities and ocean view.', 85000.0),
('9b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Weekend Escape', 'Perfect short break with late checkout.', 55000.0);

INSERT INTO hotel_package_features (hotel_package_id, feature) VALUES
('5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Welcome Drinks'), ('5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Room Decoration'), ('5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Couples Spa Session'), ('5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Dinner for two'),
('6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'Late Check-out 2 PM'), ('6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'Breakfast Included'), ('6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'Pool Access'),
('8a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Welcome Drinks'), ('8a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Room Decoration'), ('8a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Couples Spa Session'), ('8a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d', 'Dinner for two'),
('9b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'Late Check-out 2 PM'), ('9b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'Breakfast Included'), ('9b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e', 'Pool Access');


-- Seeding Rooms for both tenants
-- Marino Beach Colombo
INSERT INTO rooms (id, name, capacity, price, qty, status, image_url, owner, hotel_id, service_charge, tax_percentage, best_price, version, tenant_id, size, bed_type) VALUES
('b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Deluxe Ocean View', 2, 45000.0, 10, 'Active', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'partner@yme.lk', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 2500.0, 15.0, 42000.0, 0, 'partner@yme.lk', '350 sq ft', 'King Bed'),
('b2a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Executive Suite', 3, 75000.0, 5, 'Active', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'partner@yme.lk', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 2500.0, 15.0, 70000.0, 0, 'partner@yme.lk', '650 sq ft', 'King Bed + Sofa Bed'),
('c1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Deluxe Ocean View', 2, 45000.0, 10, 'Active', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'partner@yme.lk', 'f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 2500.0, 15.0, 42000.0, 0, 'default', '350 sq ft', 'King Bed'),
('c2a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Executive Suite', 3, 75000.0, 5, 'Active', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'partner@yme.lk', 'f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 2500.0, 15.0, 70000.0, 0, 'default', '650 sq ft', 'King Bed + Sofa Bed');

-- Seed Offers for both tenants
INSERT INTO offers (id, title, discount, active, ends, applies_to, owner, hotel_id, image_url, tenant_id) VALUES
('d1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Super Saver 15% Off', '15%', TRUE, 'Ongoing', 'everything', 'partner@yme.lk', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'partner@yme.lk'),
('e1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Super Saver 15% Off', '15%', TRUE, 'Ongoing', 'everything', 'partner@yme.lk', 'f1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'default');
