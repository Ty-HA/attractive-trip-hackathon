-- Sample data for the travel assistant RAG system

-- Insert places
INSERT INTO places (name, type, latitude, longitude, country, region, tags, description, best_months, sustainability_score) VALUES
('Bali', 'destination', -8.3405, 115.0920, 'Indonesia', 'Southeast Asia', '{"tropical", "beaches", "culture", "temples"}', 'Tropical paradise known for beaches, temples, and rich culture', '{4,5,6,7,8,9}', 75),
('Ubud', 'city', -8.5069, 115.2625, 'Indonesia', 'Bali', '{"cultural", "rice-terraces", "yoga", "art"}', 'Cultural heart of Bali with rice terraces and art scene', '{4,5,6,7,8,9}', 85),
('Lovina', 'city', -8.1582, 115.0275, 'Indonesia', 'Bali', '{"dolphins", "beaches", "snorkeling", "quiet"}', 'Northern Bali known for dolphin watching and quiet beaches', '{4,5,6,7,8,9}', 70),
('Paris', 'destination', 48.8566, 2.3522, 'France', 'Europe', '{"romance", "culture", "museums", "gastronomy"}', 'City of Light, perfect for romantic getaways', '{4,5,6,9,10}', 65),
('Santorini', 'destination', 36.3932, 25.4615, 'Greece', 'Europe', '{"romance", "sunset", "wine", "volcanic"}', 'Greek island famous for sunsets and white buildings', '{4,5,6,7,8,9}', 60);

-- Insert providers
INSERT INTO providers (name, category, subcategory, place_id, url, phone, price_range, sustainability_score, policy_excerpt, booking_info) VALUES
('Firefly Eco-Lodge', 'hotel', 'eco-lodge', (SELECT id FROM places WHERE name = 'Ubud'), 'https://firefly-eco-lodge.com', '+62-361-123456', 'mid-range', 95, 'Sustainable bamboo construction, solar power, organic farming', '{"booking_email": "reservations@firefly-eco-lodge.com", "advance_booking_days": 30}'),
('Edi Popeye Dolphin Tours', 'activity', 'dolphin-tour', (SELECT id FROM places WHERE name = 'Lovina'), 'https://lovina-dolphins.com', '+62-362-789123', 'budget', 80, 'Ethical dolphin watching, small groups, local guides', '{"booking_whatsapp": "+62-812-3456-7890", "tour_time": "06:00", "duration_hours": 3}'),
('Shangri-La Paris', 'hotel', 'luxury', (SELECT id FROM places WHERE name = 'Paris'), 'https://shangri-la.com/paris', '+33-1-53-67-19-98', 'luxury', 50, 'Luxury hotel with Eiffel Tower views', '{"booking_phone": "+33-1-53-67-19-98", "advance_booking_days": 60}'),
('Pullman Paris Tour Eiffel', 'hotel', 'business', (SELECT id FROM places WHERE name = 'Paris'), 'https://pullman-paris-tour-eiffel.com', '+33-1-44-38-56-00', 'mid-range', 55, 'Modern hotel next to Eiffel Tower', '{"booking_url": "https://pullman-paris-tour-eiffel.com/book", "advance_booking_days": 30}');

-- Insert knowledge snippets (these would normally have embeddings, but for demo we'll leave them null)
INSERT INTO knowledge_snippets (title, content, source, place_id, provider_id, tags) VALUES
('Best Time for Dolphin Watching in Lovina', 'The best time for dolphin watching in Lovina is early morning around 6:00 AM when the sea is calm and dolphins are most active. Tours typically last 2-3 hours and cost around 300,000 IDR (about $20 USD) per person. Edi Popeye is a highly recommended operator known for ethical tours that respect marine life.', 'internal', (SELECT id FROM places WHERE name = 'Lovina'), (SELECT id FROM providers WHERE name = 'Edi Popeye Dolphin Tours'), '{"dolphins", "morning", "ethical", "tour"}'),

('Firefly Eco-Lodge Ubud Review', 'Firefly Eco-Lodge in Ubud offers unique bamboo accommodation in the middle of rice fields. The Birds Nest room is accessed by ladder and provides an immersive jungle experience. The lodge operates on solar power, sources food locally, and practices permaculture. Rates range from $80-150 per night depending on room type. Book at least 30 days in advance as they are very popular.', 'internal', (SELECT id FROM places WHERE name = 'Ubud'), (SELECT id FROM providers WHERE name = 'Firefly Eco-Lodge'), '{"eco-lodge", "bamboo", "sustainable", "rice-fields"}'),

('Paris Honeymoon Hotels with Eiffel Tower Views', 'For honeymoons in Paris with Eiffel Tower views, top choices include: 1) Shangri-La Paris - luxury option with river views and terraces, starting from €1500/night. 2) Pullman Paris Tour Eiffel - modern hotel directly next to the tower, from €400/night. 3) Hotel des Invalides - boutique option with tower views from upper floors, from €300/night. Book 2-3 months in advance for best rates.', 'internal', (SELECT id FROM places WHERE name = 'Paris'), NULL, '{"honeymoon", "eiffel-tower", "views", "luxury"}'),

('Sustainable Travel in Bali', 'Bali offers many eco-friendly options: Stay in eco-lodges like Firefly in Ubud, choose reef-safe sunscreen, support local guides for activities, eat at warungs (local restaurants), and consider offsetting flight emissions. The best eco-experiences include rice terrace walks, traditional village visits, and ethical wildlife tours like dolphin watching in Lovina.', 'internal', (SELECT id FROM places WHERE name = 'Bali'), NULL, '{"sustainable", "eco-friendly", "local", "responsible"}'),

('Bali Transportation Options', 'Getting around Bali: 1) Rent a scooter (most flexible, $5-10/day) 2) Hire a driver ($40-60/day including fuel) 3) Use ride-hailing apps like Gojek or Grab 4) Tourist shuttle buses between major destinations 5) Public bemos (local buses) for budget travel. Driving distances: Denpasar to Ubud (1 hour), Ubud to Lovina (2.5 hours), Ubud to Sanur (45 minutes).', 'internal', (SELECT id FROM places WHERE name = 'Bali'), NULL, '{"transportation", "scooter", "driver", "distances"}');

-- Create a sample trip itinerary
INSERT INTO trip_itineraries (origin, dates, party, interests, constraints, itinerary, total_cost_eur, total_co2_kg) VALUES
('CDG', 
 '{"start": "2025-11-15", "end": "2025-11-22"}',
 '{"adults": 2, "kids": 0}',
 '{"dolphins", "eco-lodge", "cultural"}',
 '{"budget_eur": 1800, "co2_max_kg": 600}',
 '{
   "origin": "CDG",
   "dates": {"start": "2025-11-15", "end": "2025-11-22"},
   "party": {"adults": 2, "kids": 0},
   "interests": ["dolphins", "eco-lodge", "cultural"],
   "constraints": {"budget_eur": 1800, "co2_max_kg": 600},
   "plan": [
     {"day": 1, "location": "Denpasar", "arrival": "DPS", "transport": "flight"},
     {"day": 2, "location": "Ubud", "stay": {"hotel_id": "firefly_eco", "nights": 3}, "transport": "private_transfer"},
     {"day": 4, "location": "Lovina", "activity": {"id": "dolphin_tour", "time": "06:00", "operator": "Edi Popeye"}},
     {"day": 5, "location": "Ubud", "activity": {"id": "rice_terrace_walk", "time": "09:00"}},
     {"day": 7, "location": "Denpasar", "departure": "DPS", "transport": "flight"}
   ]
 }',
 1650.00,
 480.5
);