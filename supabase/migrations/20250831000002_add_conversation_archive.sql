-- Create archived_conversations table to store completed trip plannings
CREATE TABLE archived_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- Trip summary
  title text NOT NULL, -- "Voyage romantique à Paris - Mars 2025"
  trip_type text,
  destination_summary text, -- "3 destinations sélectionnées: Paris, Rome, Barcelona"
  total_budget numeric,
  duration_days int,
  trip_dates jsonb, -- {"from": "2025-03-15", "to": "2025-03-22"}
  
  -- Archived preferences (snapshot at completion)
  preferences jsonb NOT NULL, -- Complete user_preferences snapshot
  
  -- Conversation history
  messages jsonb NOT NULL, -- Complete chat history
  
  -- Results and recommendations that were generated
  final_recommendations jsonb, -- The 3 options that were presented
  selected_option jsonb, -- Which option user chose (if any)
  booking_status text DEFAULT 'planned', -- 'planned', 'booking_started', 'booked', 'completed'
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz,
  
  -- Search and filtering
  tags text[] DEFAULT '{}', -- ['romantique', 'europe', 'mars', 'luxe']
  is_favorite boolean DEFAULT false,
  notes text -- User's personal notes about this trip
);

-- Indexes for performance
CREATE INDEX idx_archived_conversations_user_id ON archived_conversations(user_id);
CREATE INDEX idx_archived_conversations_trip_type ON archived_conversations(trip_type);
CREATE INDEX idx_archived_conversations_created_at ON archived_conversations(created_at DESC);
CREATE INDEX idx_archived_conversations_tags ON archived_conversations USING GIN(tags);

-- Enable RLS
ALTER TABLE archived_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own archived conversations" ON archived_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own archived conversations" ON archived_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own archived conversations" ON archived_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own archived conversations" ON archived_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Add conversation_count to user_preferences for stats
ALTER TABLE user_preferences 
ADD COLUMN conversation_count int DEFAULT 0,
ADD COLUMN last_completed_at timestamptz;

-- Function to generate trip title automatically
CREATE OR REPLACE FUNCTION generate_trip_title(
  p_trip_type text,
  p_destinations text,
  p_trip_dates jsonb
) RETURNS text AS $$
DECLARE
  title_parts text[] := '{}';
  month_name text;
  year_text text;
BEGIN
  -- Add trip type
  CASE p_trip_type
    WHEN 'city-break' THEN title_parts := array_append(title_parts, 'City-break');
    WHEN 'plage' THEN title_parts := array_append(title_parts, 'Séjour plage');
    WHEN 'nature' THEN title_parts := array_append(title_parts, 'Voyage nature');
    WHEN 'aventure' THEN title_parts := array_append(title_parts, 'Aventure');
    WHEN 'romantique' THEN title_parts := array_append(title_parts, 'Voyage romantique');
    WHEN 'famille' THEN title_parts := array_append(title_parts, 'Voyage en famille');
    WHEN 'luxe' THEN title_parts := array_append(title_parts, 'Séjour de luxe');
    WHEN 'workation' THEN title_parts := array_append(title_parts, 'Workation');
    ELSE title_parts := array_append(title_parts, 'Voyage');
  END CASE;
  
  -- Add destination if provided
  IF p_destinations IS NOT NULL AND LENGTH(p_destinations) > 0 THEN
    title_parts := array_append(title_parts, p_destinations);
  END IF;
  
  -- Add month/year from dates
  IF p_trip_dates IS NOT NULL AND p_trip_dates->>'from' IS NOT NULL THEN
    SELECT TO_CHAR(TO_DATE(p_trip_dates->>'from', 'YYYY-MM-DD'), 'TMMonth YYYY') INTO month_name;
    title_parts := array_append(title_parts, month_name);
  END IF;
  
  RETURN array_to_string(title_parts, ' - ');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update last_accessed_at
CREATE OR REPLACE FUNCTION update_archived_conversation_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_archived_conversation_accessed_trigger
  BEFORE UPDATE ON archived_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_archived_conversation_accessed();