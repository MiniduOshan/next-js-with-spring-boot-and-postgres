import { useState, useEffect } from 'react';
import { Hotel } from './adminData'; // Assuming Hotel type is exported or we can just use any

export interface SavedHotel {
  id: string;
  name: string;
  image: string;
  locationDetail: string;
  price: string | number;
  rating: string | number;
  slug: string;
}

export function useSavedHotels() {
  const [savedHotels, setSavedHotels] = useState<SavedHotel[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('yme_saved_hotels');
      if (stored) {
        setSavedHotels(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved hotels', e);
    }
  }, []);

  const saveHotel = (hotel: any, slug: string) => {
    setSavedHotels(prev => {
      const exists = prev.some(h => h.id === hotel.id);
      let newSaved;
      if (exists) {
        newSaved = prev.filter(h => h.id !== hotel.id);
      } else {
        newSaved = [...prev, {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945",
          locationDetail: hotel.locationDetail || hotel.location || "",
          price: hotel.price || 0,
          rating: hotel.rating || 0,
          slug: slug
        }];
      }
      localStorage.setItem('yme_saved_hotels', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const isSaved = (hotelId: string) => savedHotels.some(h => h.id === hotelId);

  return { savedHotels, saveHotel, isSaved };
}
