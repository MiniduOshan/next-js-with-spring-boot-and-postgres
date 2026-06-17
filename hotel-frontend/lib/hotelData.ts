
export interface Hotel {
  id: number | string;
  name: string;
  location: string;
  locationDetail: string;
  rating: number;
  ratingText: string;
  reviewsCount: number;
  price: number;
  image: string;
  images?: string[];
  type: string;
  stars: number;
  amenities: string[];
  description: string;
  isSpecial?: boolean;
  verified?: boolean;
  owner?: string;
  rules?: string[];
  policies?: string[];
  packages?: { name: string; description: string; price: number; features: string[] }[];
}

export const ALL_HOTELS: Hotel[] = [
  {
    id: 1,
    name: "Marino Beach Colombo",
    location: "Colombo",
    locationDetail: "Colombo 03, Colombo",
    rating: 9.3,
    ratingText: "Superb",
    reviewsCount: 1204,
    price: 45000,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    type: "Hotels",
    stars: 5,
    amenities: ["Swimming Pool", "Free WiFi", "Breakfast Included", "Air Conditioning", "Free Parking", "Spa"],
    description: "Experience world-class service at Marino Beach Colombo. Featuring an incredible rooftop infinity pool overlooking the ocean, fitness center, and multiple fine dining options.",
    isSpecial: true,
    owner: "partner@yme.lk",
    rules: [
      "Check-in from 14:00 to 23:30",
      "Check-out from 06:00 to 12:00",
      "Pets are not allowed",
      "Smoking is prohibited in all rooms"
    ],
    policies: [
      "Free cancellation before 48 hours of check-in",
      "Payment taken at the property",
      "All children are welcome. Cots available on request."
    ],
    packages: [
      {
        name: "Honeymoon Package",
        description: "Romantic getaway with special amenities and ocean view.",
        price: 85000,
        features: ["Welcome Drinks", "Room Decoration", "Couples Spa Session", "Dinner for two"]
      },
      {
        name: "Weekend Escape",
        description: "Perfect short break with late checkout.",
        price: 55000,
        features: ["Late Check-out 2 PM", "Breakfast Included", "Pool Access"]
      }
    ]
  },
  {
    id: 2,
    name: "Heritance Kandalama",
    location: "Dambulla",
    locationDetail: "Kandalama, Dambulla",
    rating: 9.5,
    ratingText: "Exceptional",
    reviewsCount: 850,
    price: 85000,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    type: "Resorts",
    stars: 5,
    amenities: ["Swimming Pool", "Free WiFi", "Breakfast Included", "Air Conditioning", "Free Parking", "Spa"],
    description: "Designed by the legendary architect Geoffrey Bawa, Heritance Kandalama is a unique eco-resort nestled amidst lush jungles and looking out over the scenic Kandalama Tank reservoir.",
    isSpecial: true,
    owner: "partner@yme.lk",
    rules: [
      "Check-in from 14:00 to 22:00",
      "Check-out from 07:00 to 11:30",
      "No smoking indoors",
      "Wildlife feeding strictly prohibited"
    ],
    policies: [
      "Free cancellation 7 days before arrival",
      "Eco-friendly waste disposal required",
      "No loud music after 10 PM"
    ],
    packages: [
      {
        name: "Eco Adventure Package",
        description: "Explore the wild with our guided tours.",
        price: 95000,
        features: ["Jungle Trekking", "Bird Watching", "All Meals Included"]
      }
    ]
  },
  {
    id: 3,
    name: "98 Acres Resort & Spa",
    location: "Ella",
    locationDetail: "Passara Road, Ella",
    rating: 9.6,
    ratingText: "Exceptional",
    reviewsCount: 2100,
    price: 95000,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    type: "Resorts",
    stars: 5,
    amenities: ["Swimming Pool", "Free WiFi", "Breakfast Included", "Air Conditioning", "Spa"],
    description: "A scenic boutique retreat in Ella, surrounded by lush tea estates. 98 Acres Resort offers luxurious chalets made of wood, grass and thatch with exquisite panoramic views of the mountains.",
    owner: "partner@yme.lk",
    rules: [
      "Check-in from 14:00",
      "Check-out before 12:00",
      "Quiet hours after 21:00"
    ],
    policies: [
      "Non-refundable rate applies for certain bookings",
      "Credit card required for booking guarantee"
    ],
    packages: [
      {
        name: "Mountain Explorer",
        description: "Hike Little Adam's Peak with a guide.",
        price: 105000,
        features: ["Guided Trek", "Picnic Lunch", "Spa Voucher"]
      },
      {
        name: "Romantic Retreat",
        description: "A private getaway in the hills.",
        price: 120000,
        features: ["Private Dinner", "Champagne", "Late Check-out"]
      }
    ]
  },
  {
    id: 4,
    name: "Cinnamon Bentota Beach",
    location: "Bentota",
    locationDetail: "Bentota Beach, Bentota",
    rating: 9.1,
    ratingText: "Superb",
    reviewsCount: 640,
    price: 55000,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    type: "Resorts",
    stars: 5,
    amenities: ["Swimming Pool", "Free WiFi", "Breakfast Included", "Air Conditioning", "Free Parking", "Beachfront"],
    description: "A gorgeous beachfront resort blending Geoffrey Bawa architecture with contemporary art, situated on the golden beaches of Bentota with premium amenities and water sports options.",
    owner: "partner@yme.lk",
    rules: [
      "Check-in at 14:00",
      "Check-out at 12:00",
      "No pets allowed"
    ],
    policies: [
      "Free cancellation 3 days prior",
      "Water sports require advance booking"
    ],
    packages: [
      {
        name: "Water Sports Package",
        description: "Enjoy the best of Bentota beach.",
        price: 75000,
        features: ["Jet Ski Ride", "Banana Boat", "Snorkeling Gear", "Lunch Buffet"]
      }
    ]
  },
  {
    id: 5,
    name: "Galle Fort Hotel",
    location: "Galle",
    locationDetail: "Church Street, Galle Fort",
    rating: 9.2,
    ratingText: "Superb",
    reviewsCount: 380,
    price: 32000,
    image: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    type: "Hotels",
    stars: 4,
    amenities: ["Free WiFi", "Breakfast Included", "Air Conditioning", "Swimming Pool"],
    description: "A beautifully restored 18th-century Dutch merchant house, Galle Fort Hotel offers a historical boutique atmosphere right in the heart of the UNESCO World Heritage Galle Fort.",
    owner: "partner@yme.lk",
    rules: [
      "Check-in from 14:00 to 20:00",
      "Check-out from 08:00 to 11:00",
      "No loud parties"
    ],
    policies: [
      "Non-refundable policy for last minute bookings",
      "Heritage conservation fees included in room rate"
    ],
    packages: [
      {
        name: "Heritage Tour Package",
        description: "A deep dive into the history of Galle.",
        price: 60000,
        features: ["Guided Fort Walk", "Historical Museum Entry", "Afternoon High Tea"]
      }
    ]
  }
];

export const MOCK_ROOMS = [
    {
        name: "Deluxe Ocean View",
        price: 45000,
        capacity: 2,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        owner: "partner@yme.lk"
    },
    {
        name: "Executive Suite",
        price: 75000,
        capacity: 3,
        imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        owner: "partner@yme.lk"
    },
    {
        name: "Superior Twin Room",
        price: 35000,
        capacity: 2,
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        images: [],
        owner: "partner@yme.lk"
    }
];
