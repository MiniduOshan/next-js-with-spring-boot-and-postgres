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
