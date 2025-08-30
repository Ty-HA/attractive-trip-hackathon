-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Places table for locations
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'destination', 'city', 'region'
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  country TEXT NOT NULL,
  region TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  best_months INTEGER[] DEFAULT '{}', -- [1,2,3] for Jan, Feb, Mar
  sustainability_score INTEGER DEFAULT 0, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Providers table for hotels, activities, restaurants, transport
CREATE TABLE providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hotel', 'activity', 'restaurant', 'transport'
  subcategory TEXT, -- 'eco-lodge', 'dolphin-tour', 'fine-dining', 'bus'
  place_id UUID REFERENCES places(id),
  url TEXT,
  phone TEXT,
  email TEXT,
  price_range TEXT, -- 'budget', 'mid-range', 'luxury'
  sustainability_score INTEGER DEFAULT 0,
  policy_excerpt TEXT,
  booking_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge snippets for RAG
CREATE TABLE knowledge_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL, -- 'internal', 'web', 'official'
  source_url TEXT,
  place_id UUID REFERENCES places(id),
  provider_id UUID REFERENCES providers(id),
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536), -- OpenAI embedding size
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip itineraries
CREATE TABLE trip_itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  status TEXT DEFAULT 'draft', -- 'draft', 'quoted', 'booked', 'completed'
  origin TEXT NOT NULL,
  dates JSONB NOT NULL, -- {"start": "2025-10-12", "end": "2025-10-19"}
  party JSONB NOT NULL, -- {"adults": 2, "kids": 0}
  interests TEXT[] DEFAULT '{}',
  constraints JSONB DEFAULT '{}', -- {"budget_eur": 1800, "co2_max_kg": 600}
  itinerary JSONB NOT NULL, -- Full itinerary structure
  total_cost_eur DECIMAL(10, 2),
  total_co2_kg DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings for tracking reservations
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trip_itineraries(id),
  provider_id UUID REFERENCES providers(id),
  type TEXT NOT NULL, -- 'flight', 'hotel', 'activity', 'transport'
  booking_reference TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  amount_eur DECIMAL(10, 2),
  booking_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_places_location ON places USING GIST (ll_to_earth(latitude, longitude));
CREATE INDEX idx_places_country ON places(country);
CREATE INDEX idx_places_tags ON places USING GIN(tags);

CREATE INDEX idx_providers_category ON providers(category);
CREATE INDEX idx_providers_place ON providers(place_id);

CREATE INDEX idx_knowledge_snippets_embedding ON knowledge_snippets USING IVFFLAT (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_knowledge_snippets_tags ON knowledge_snippets USING GIN(tags);
CREATE INDEX idx_knowledge_snippets_place ON knowledge_snippets(place_id);

CREATE INDEX idx_trip_itineraries_user ON trip_itineraries(user_id);
CREATE INDEX idx_trip_itineraries_status ON trip_itineraries(status);

-- RLS policies (basic)
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow read access to all for places, providers, and knowledge
CREATE POLICY "Allow read access to places" ON places FOR SELECT USING (true);
CREATE POLICY "Allow read access to providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Allow read access to knowledge" ON knowledge_snippets FOR SELECT USING (true);

-- Trip itineraries and bookings can be read/written by users
CREATE POLICY "Users can manage their trips" ON trip_itineraries FOR ALL USING (true);
CREATE POLICY "Users can manage their bookings" ON bookings FOR ALL USING (true);