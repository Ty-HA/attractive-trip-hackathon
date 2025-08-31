-- Create user_preferences table for onboarding slot-filling
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Core slots
  trip_type text, -- city-break, plage, nature, aventure, romantique, famille, luxe, workation
  dates jsonb, -- {"from": "2025-10-20", "to": "2025-10-27", "flexible": true}
  duration_days int, -- 2-4, 5-7, 8-14, 15+
  budget_total int, -- en EUR
  origin_city text, -- PAR, LYS, NCE, etc.
  companions jsonb, -- {"type": "couple|family|friends|solo", "kids_ages": [8,12]}
  interests text[], -- ['food','museum','hike','snorkeling', ...]
  constraints jsonb, -- {"no_layover": true, "pet": true, "mobility": "low"}
  hotel_prefs jsonb, -- {"stars": 4, "board": "BB", "area": "central"}
  
  -- Metadata
  is_complete boolean DEFAULT false, -- true when all essential slots filled
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Unique constraint to ensure one preference per user
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_trip_type ON user_preferences(trip_type);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();