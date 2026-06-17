import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateHotelSlug(hotel: any) {
  const location = hotel.location || hotel.city || hotel.address || 'sri-lanka';
  const name = hotel.name || hotel.propertyName || 'hotel';
  return `hotel-in-${location}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
