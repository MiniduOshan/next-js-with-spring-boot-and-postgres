import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface CategoryData {
  id: string;
  name: string;
  description: string;
  count: string;
  icon: string;
  image: string;
  color: string;
}

export interface FilterGroup {
  id: string;
  name: string;
  description: string;
  items: string[];
}

export interface FilterList {
  locations: string[];
  propertyTypes: string[];
  amenities: string[];
}

const DEFAULT_CATEGORIES: CategoryData[] = [
  {
    id: 'beach',
    name: 'Beach Hotels',
    description: 'Relax by the ocean with stunning coastal views.',
    count: '124 Properties',
    icon: 'Palmtree',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    id: 'luxury',
    name: 'Luxury Resorts',
    description: 'Experience world-class service and premium amenities.',
    count: '86 Properties',
    icon: 'Star',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-amber-50 text-amber-600'
  },
  {
    id: 'mountain',
    name: 'Mountain Hotels',
    description: 'Cool escapes in the lush green highlands.',
    count: '92 Properties',
    icon: 'Mountain',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    id: 'villas',
    name: 'Private Villas',
    description: 'Exclusive properties for ultimate privacy and space.',
    count: '156 Properties',
    icon: 'Building2',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    id: 'family',
    name: 'Family Friendly',
    description: 'Hotels with activities and spaces designed for all ages.',
    count: '210 Properties',
    icon: 'Users',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-rose-50 text-rose-600'
  },
  {
    id: 'eco',
    name: 'Eco Lodges',
    description: 'Sustainable stays immersed in nature.',
    count: '45 Properties',
    icon: 'Tent',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-green-50 text-green-600'
  },
  {
    id: 'boutique',
    name: 'Boutique Hotels',
    description: 'Charming, unique stays with personalized service.',
    count: '68 Properties',
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-pink-50 text-pink-650'
  },
  {
    id: 'budget',
    name: 'Budget Stays',
    description: 'Clean, comfortable, and affordable accommodations.',
    count: '320 Properties',
    icon: 'Map',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1000&auto=format&fit=crop',
    color: 'bg-slate-100 text-slate-600 dark:text-slate-400'
  }
];

const DEFAULT_FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'locations',
    name: 'Location',
    description: 'Control destinations travelers search & filter for.',
    items: ["Colombo", "Ella", "Kandy", "Dambulla", "Bentota", "Galle", "Negombo"]
  },
  {
    id: 'priceRanges',
    name: 'Price per night',
    description: 'Refine stays matching the traveler budget.',
    items: ["LKR 0 - LKR 10,000", "LKR 10,000 - LKR 20,000", "LKR 20,000 - LKR 50,000", "LKR 50,000+"]
  },
  {
    id: 'propertyTypes',
    name: 'Property Type',
    description: 'Define classifications like Resorts, Cabins, etc.',
    items: ["Hotels", "Resorts", "Villas", "Guest Houses"]
  },
  {
    id: 'amenities',
    name: 'Amenities',
    description: 'Key property conveniences (Pool, Spa, Beachfront).',
    items: ["Swimming Pool", "Free WiFi", "Breakfast Included", "Air Conditioning", "Free Parking", "Spa", "Beachfront"]
  }
];

// LocalStorage Keys
const KEY_CATEGORIES = 'yme_admin_categories';
const KEY_FILTER_GROUPS = 'yme_admin_filter_groups';

export function getCategories(): CategoryData[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const cached = localStorage.getItem(KEY_CATEGORIES);
  if (!cached) {
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: CategoryData[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(categories));
  }
}

export function getFilterGroups(): FilterGroup[] {
  if (typeof window === 'undefined') return DEFAULT_FILTER_GROUPS;
  const cached = localStorage.getItem(KEY_FILTER_GROUPS);
  if (!cached) {
    // Check if there is data in the legacy KEY_FILTERS representation to migrate
    const legacyKey = 'yme_admin_filters';
    const legacyData = localStorage.getItem(legacyKey);
    if (legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        const migrated: FilterGroup[] = [
          {
            id: 'locations',
            name: 'Location',
            description: 'Control destinations travelers search & filter for.',
            items: parsed.locations || []
          },
          {
            id: 'priceRanges',
            name: 'Price per night',
            description: 'Refine stays matching the traveler budget.',
            items: ["LKR 0 - LKR 10,000", "LKR 10,000 - LKR 20,000", "LKR 20,050 - LKR 50,000", "LKR 50,000+"]
          },
          {
            id: 'propertyTypes',
            name: 'Property Type',
            description: 'Define classifications like Resorts, Cabins, etc.',
            items: parsed.propertyTypes || []
          },
          {
            id: 'amenities',
            name: 'Amenities',
            description: 'Key property conveniences (Pool, Spa, Beachfront).',
            items: parsed.amenities || []
          }
        ];
        localStorage.setItem(KEY_FILTER_GROUPS, JSON.stringify(migrated));
        localStorage.removeItem(legacyKey);
        return migrated;
      } catch (e) {
        // Fallback to default
      }
    }
    localStorage.setItem(KEY_FILTER_GROUPS, JSON.stringify(DEFAULT_FILTER_GROUPS));
    return DEFAULT_FILTER_GROUPS;
  }
  try {
    return JSON.parse(cached);
  } catch (e) {
    return DEFAULT_FILTER_GROUPS;
  }
}

export function saveFilterGroups(groups: FilterGroup[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_FILTER_GROUPS, JSON.stringify(groups));
  }
}

// Keep legacy getFilters and saveFilters for backward compatibility
export function getFilters(): FilterList {
  const groups = getFilterGroups();
  const locs = groups.find(g => g.id === 'locations')?.items || [];
  const types = groups.find(g => g.id === 'propertyTypes')?.items || [];
  const ams = groups.find(g => g.id === 'amenities')?.items || [];
  return {
    locations: locs,
    propertyTypes: types,
    amenities: ams
  };
}

export function saveFilters(filters: FilterList) {
  const groups = getFilterGroups();
  const updated = groups.map(g => {
    if (g.id === 'locations') return { ...g, items: filters.locations };
    if (g.id === 'propertyTypes') return { ...g, items: filters.propertyTypes };
    if (g.id === 'amenities') return { ...g, items: filters.amenities };
    return g;
  });
  saveFilterGroups(updated);
}

export function renderLucideIcon(iconName: string, className?: string) {
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return React.createElement(IconComponent, { className });
  }
  return React.createElement(LucideIcons.HelpCircle, { className });
}
