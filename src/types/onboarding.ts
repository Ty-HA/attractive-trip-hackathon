// Types for the onboarding slot-filling system

export type TripType = 
  | 'city-break' 
  | 'plage' 
  | 'nature' 
  | 'aventure' 
  | 'romantique' 
  | 'famille' 
  | 'luxe' 
  | 'workation';

export type DurationRange = '2-4' | '5-7' | '8-14' | '15+';
export type BudgetRange = '<500' | '500-1000' | '1000-2000' | '2000-3500' | '3500+';
export type OriginCity = 'PAR' | 'LYS' | 'NCE' | 'TLS' | 'BDX' | 'STR';
export type CompanionType = 'solo' | 'couple' | 'friends' | 'family';

export interface DatePreference {
  from?: string;
  to?: string;
  flexible: boolean;
  flexibility_days?: number; // ±3 days
}

export interface Companions {
  type: CompanionType;
  adults?: number;
  kids_ages?: number[];
}

export interface TravelConstraints {
  no_layover?: boolean;
  pet?: boolean;
  mobility?: 'high' | 'medium' | 'low';
  dietary?: string[];
  languages?: string[];
  visa_restrictions?: boolean;
}

export interface HotelPreferences {
  stars?: 3 | 4 | 5;
  board?: 'RO' | 'BB' | 'HB' | 'AI'; // Room Only, Bed & Breakfast, Half Board, All Inclusive
  area?: 'central' | 'beach' | 'quiet' | 'transport';
  chains?: string[];
}

export interface OnboardingSlots {
  trip_type?: TripType;
  dates?: DatePreference;
  duration_days?: number;
  budget_total?: number;
  origin_city?: OriginCity;
  companions?: Companions;
  interests?: string[];
  constraints?: TravelConstraints;
  hotel_prefs?: HotelPreferences;
}

export interface OnboardingQuestion {
  slot: keyof OnboardingSlots;
  hint?: string;
  options?: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
}

export interface OnboardingResponse {
  response: string;
  next_question?: OnboardingQuestion;
  slots?: OnboardingSlots;
  suggestedActions?: string[];
  is_complete?: boolean;
}

// Quick reply options for each slot
export const QUICK_REPLIES = {
  trip_type: [
    { label: 'City-break', value: 'city-break', description: 'Villes et culture' },
    { label: 'Plage', value: 'plage', description: 'Soleil et détente' },
    { label: 'Nature', value: 'nature', description: 'Parcs et paysages' },
    { label: 'Aventure', value: 'aventure', description: 'Sensations fortes' },
    { label: 'Romantique', value: 'romantique', description: 'En amoureux' },
    { label: 'Famille', value: 'famille', description: 'Avec enfants' },
    { label: 'Luxe', value: 'luxe', description: 'Prestige et confort' },
    { label: 'Workation', value: 'workation', description: 'Travail et voyage' }
  ],
  budget_total: [
    { label: '< 500€', value: '<500', description: 'Budget serré' },
    { label: '500-1000€', value: '500-1000', description: 'Économique' },
    { label: '1000-2000€', value: '1000-2000', description: 'Confortable' },
    { label: '2000-3500€', value: '2000-3500', description: 'Premium' },
    { label: '3500€+', value: '3500+', description: 'Luxe' }
  ],
  duration_days: [
    { label: '2-4 jours', value: 3, description: 'Week-end prolongé' },
    { label: '5-7 jours', value: 6, description: 'Une semaine' },
    { label: '8-14 jours', value: 10, description: 'Deux semaines' },
    { label: '15+ jours', value: 21, description: 'Long séjour' }
  ],
  companions: [
    { label: 'Solo', value: 'solo', description: 'Je voyage seul(e)' },
    { label: 'En couple', value: 'couple', description: 'À deux' },
    { label: 'Entre amis', value: 'friends', description: 'Avec des amis' },
    { label: 'En famille', value: 'family', description: 'Avec enfants' }
  ],
  origin_city: [
    { label: 'Paris', value: 'PAR', description: 'CDG/ORY' },
    { label: 'Lyon', value: 'LYS', description: 'Saint-Exupéry' },
    { label: 'Nice', value: 'NCE', description: 'Côte d\'Azur' },
    { label: 'Toulouse', value: 'TLS', description: 'Blagnac' },
    { label: 'Bordeaux', value: 'BDX', description: 'Mérignac' },
    { label: 'Strasbourg', value: 'STR', description: 'Entzheim' }
  ]
} as const;

// Essential slots that must be filled before search
export const ESSENTIAL_SLOTS: (keyof OnboardingSlots)[] = [
  'trip_type',
  'budget_total',
  'duration_days',
  'companions',
  'origin_city'
];

// Helper to check if onboarding is complete
export function isOnboardingComplete(slots: OnboardingSlots): boolean {
  return ESSENTIAL_SLOTS.every(slot => slots[slot] !== undefined && slots[slot] !== null);
}