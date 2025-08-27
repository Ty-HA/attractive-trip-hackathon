-- Add some sample restaurant data
INSERT INTO public.restaurants (name, slug, description, cuisine_type, specialties, city, country, price_range, rating, review_count, featured_image_url, is_featured) VALUES
('Le Petit Bistro', 'le-petit-bistro-paris', 'Bistro français authentique au cœur de Paris', 'Française', ARRAY['Coq au vin', 'Escargots', 'Crème brûlée'], 'Paris', 'France', 'medium', 4.5, 245, 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3', true),
('Sakura Sushi', 'sakura-sushi-tokyo', 'Sushi traditionnel avec des ingrédients frais du marché de Tsukiji', 'Japonaise', ARRAY['Sushi', 'Sashimi', 'Tempura'], 'Tokyo', 'Japon', 'high', 4.8, 892, 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3', true),
('Taverna Mykonos', 'taverna-mykonos-santorini', 'Cuisine grecque traditionnelle avec vue sur la mer Égée', 'Grecque', ARRAY['Moussaka', 'Souvlaki', 'Baklava'], 'Santorin', 'Grèce', 'medium', 4.3, 156, 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3', true),
('Warung Bali', 'warung-bali-ubud', 'Cuisine balinaise authentique dans un cadre tropical', 'Indonésienne', ARRAY['Nasi goreng', 'Satay', 'Gado-gado'], 'Ubud', 'Indonésie', 'budget', 4.6, 324, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3', false),
('La Pergola Roma', 'la-pergola-roma', 'Restaurant étoilé avec vue panoramique sur Rome', 'Italienne', ARRAY['Risotto', 'Osso buco', 'Tiramisu'], 'Rome', 'Italie', 'luxury', 4.9, 78, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3', true),
('El Celler Barcelona', 'el-celler-barcelona', 'Tapas modernes et vins catalans d''exception', 'Espagnole', ARRAY['Paella', 'Jamón ibérico', 'Crema catalana'], 'Barcelone', 'Espagne', 'high', 4.7, 421, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3', true),
('Trattoria Venezia', 'trattoria-venezia', 'Cuisine vénitienne traditionnelle', 'Italienne', ARRAY['Risotto nero', 'Sarde in saor', 'Gelato'], 'Venise', 'Italie', 'medium', 4.4, 189, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3', false),
('Café de Flore', 'cafe-de-flore-paris', 'Brasserie parisienne historique', 'Française', ARRAY['Croque-monsieur', 'Onion soup', 'Macarons'], 'Paris', 'France', 'medium', 4.2, 567, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3', true);

-- Link some restaurants to destinations (you'll need to get the actual destination IDs)
UPDATE public.restaurants 
SET destination_id = (SELECT id FROM public.destinations WHERE title LIKE '%Santorin%' LIMIT 1)
WHERE slug = 'taverna-mykonos-santorini';

UPDATE public.restaurants 
SET destination_id = (SELECT id FROM public.destinations WHERE title LIKE '%Bali%' LIMIT 1)
WHERE slug = 'warung-bali-ubud';