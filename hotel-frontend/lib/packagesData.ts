// Central constants for YME Hotels subscription plans.
// Admin can override content via localStorage key: yme_system_packages

export interface SystemPackage {
  id: 'free' | 'pro' | 'premium';
  name: string;
  price: number;          // LKR per month (0 = free)
  billing: string;        // display label e.g. "/ month"
  description: string;
  features: string[];
  highlighted: boolean;   // true = show as "Most Popular"
  badge?: string;
  status: 'Active' | 'Inactive';
  maxHotels: number;
}

export const DEFAULT_PACKAGES: SystemPackage[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billing: 'Commission',
    description: 'Perfect for getting started. List your first hotel and start accepting bookings with no upfront cost.',
    features: [
      'Up to 3 Hotel listings',
      'Max 10 Bookings Allowed',
      '0% Commission',
      'Basic booking management',
      'Standard support (email)',
      'Public hotel profile',
      'Guest review display',
    ],
    highlighted: false,
    status: 'Active',
    maxHotels: 3,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5,
    billing: '% Commission',
    description: 'For growing hospitality businesses. Manage multiple properties and unlock advanced tools.',
    features: [
      'Up to 10 Hotel listings',
      'Max 100 Bookings Allowed',
      '5% Commission per Booking',
      'Advanced booking management',
      'Priority email & phone support',
      'Promotions & special offers',
      'Basic analytics dashboard',
    ],
    highlighted: false,
    badge: 'Popular',
    status: 'Active',
    maxHotels: 10,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 7,
    billing: '% Commission',
    description: 'The ultimate platform for hotel chains & resorts. Full access to every feature with VIP support.',
    features: [
      'Unlimited hotel listings',
      'Unlimited Bookings',
      '7% Commission per Booking',
      'Full analytics & revenue reports',
      '24/7 VIP dedicated support',
      'API access & integrations',
      'Priority listing placement',
    ],
    highlighted: true,
    badge: 'Best Value',
    status: 'Active',
    maxHotels: Infinity,
  },
];

const STORAGE_KEY = 'yme_system_packages';

/** Load packages — admin overrides stored in localStorage take priority */
export function getSystemPackages(): SystemPackage[] {
  if (typeof window === 'undefined') return DEFAULT_PACKAGES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: SystemPackage[] = JSON.parse(stored);
      // Merge stored data with defaults to ensure no missing fields
      return DEFAULT_PACKAGES.map(def => {
        const override = parsed.find(p => p.id === def.id);
        return override ? { ...def, ...override } : def;
      });
    }
  } catch {
    /* ignore parse errors */
  }
  return DEFAULT_PACKAGES;
}

/** Save admin edits to localStorage */
export function saveSystemPackages(packages: SystemPackage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
}
