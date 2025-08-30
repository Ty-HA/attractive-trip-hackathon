-- Vector similarity function for RAG
CREATE OR REPLACE FUNCTION match_knowledge_snippets(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  source text,
  source_url text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    knowledge_snippets.id,
    knowledge_snippets.title,
    knowledge_snippets.content,
    knowledge_snippets.source,
    knowledge_snippets.source_url,
    1 - (knowledge_snippets.embedding <=> query_embedding) AS similarity
  FROM knowledge_snippets
  WHERE 1 - (knowledge_snippets.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_snippets.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to search places by location
CREATE OR REPLACE FUNCTION search_places_near(
  lat float,
  lng float,
  radius_km float DEFAULT 50,
  place_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  type text,
  latitude decimal,
  longitude decimal,
  country text,
  distance_km float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    places.id,
    places.name,
    places.type,
    places.latitude,
    places.longitude,
    places.country,
    earth_distance(ll_to_earth(lat, lng), ll_to_earth(places.latitude, places.longitude)) / 1000 AS distance_km
  FROM places
  WHERE 
    earth_distance(ll_to_earth(lat, lng), ll_to_earth(places.latitude, places.longitude)) <= radius_km * 1000
    AND (place_type IS NULL OR places.type = place_type)
  ORDER BY distance_km
$$;

-- Function to get providers by place and category
CREATE OR REPLACE FUNCTION get_providers_by_place(
  place_name text,
  provider_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  subcategory text,
  place_name text,
  sustainability_score int,
  booking_info jsonb
)
LANGUAGE sql STABLE
AS $$
  SELECT
    providers.id,
    providers.name,
    providers.category,
    providers.subcategory,
    places.name as place_name,
    providers.sustainability_score,
    providers.booking_info
  FROM providers
  JOIN places ON providers.place_id = places.id
  WHERE 
    places.name ILIKE '%' || place_name || '%'
    AND (provider_category IS NULL OR providers.category = provider_category)
  ORDER BY providers.sustainability_score DESC, providers.name
$$;