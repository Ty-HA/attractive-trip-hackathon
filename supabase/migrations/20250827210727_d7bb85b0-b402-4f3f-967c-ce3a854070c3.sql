-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cuisine_type TEXT NOT NULL,
  specialties ARRAY DEFAULT '{}',
  address TEXT,
  city TEXT,
  country TEXT,
  destination_id UUID REFERENCES public.destinations(id),
  phone TEXT,
  email TEXT,
  website TEXT,
  price_range TEXT DEFAULT 'medium', -- 'budget', 'medium', 'high', 'luxury'
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  opening_hours JSONB,
  images ARRAY DEFAULT '{}',
  featured_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  location_coordinates POINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Available restaurants are viewable by everyone" 
ON public.restaurants 
FOR SELECT 
USING ((is_available = true) OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage restaurants" 
ON public.restaurants 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create restaurant_activities junction table
CREATE TABLE public.restaurant_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  distance_km DECIMAL(5,2), -- Distance in kilometers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, activity_id)
);

-- Enable RLS for junction table
ALTER TABLE public.restaurant_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant activities are viewable by everyone"
ON public.restaurant_activities 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage restaurant activities"
ON public.restaurant_activities 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create restaurant_packages junction table  
CREATE TABLE public.restaurant_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  included_in_package BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, package_id)
);

-- Enable RLS for junction table
ALTER TABLE public.restaurant_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant packages are viewable by everyone"
ON public.restaurant_packages 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage restaurant packages"
ON public.restaurant_packages 
FOR ALL 
USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample data
INSERT INTO public.restaurants (name, slug, description, cuisine_type, specialties, city, country, price_range, rating, review_count, featured_image_url, is_featured) VALUES
('Le Petit Bistro', 'le-petit-bistro-paris', 'Bistro français authentique au cœur de Paris', 'Française', ARRAY['Coq au vin', 'Escargots', 'Crème brûlée'], 'Paris', 'France', 'medium', 4.5, 245, 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3', true),
('Sakura Sushi', 'sakura-sushi-tokyo', 'Sushi traditionnel avec des ingrédients frais du marché de Tsukiji', 'Japonaise', ARRAY['Sushi', 'Sashimi', 'Tempura'], 'Tokyo', 'Japon', 'high', 4.8, 892, 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3', true),
('Taverna Mykonos', 'taverna-mykonos-santorini', 'Cuisine grecque traditionnelle avec vue sur la mer Égée', 'Grecque', ARRAY['Moussaka', 'Souvlaki', 'Baklava'], 'Santorin', 'Grèce', 'medium', 4.3, 156, 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3', true),
('Warung Bali', 'warung-bali-ubud', 'Cuisine balinaise authentique dans un cadre tropical', 'Indonésienne', ARRAY['Nasi goreng', 'Satay', 'Gado-gado'], 'Ubud', 'Indonésie', 'budget', 4.6, 324, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3', false),
('La Pergola Roma', 'la-pergola-roma', 'Restaurant étoilé avec vue panoramique sur Rome', 'Italienne', ARRAY['Risotto', 'Osso buco', 'Tiramisu'], 'Rome', 'Italie', 'luxury', 4.9, 78, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3', true),
('El Celler Barcelona', 'el-celler-barcelona', 'Tapas modernes et vins catalans d''exception', 'Espagnole', ARRAY['Paella', 'Jamón ibérico', 'Crema catalana'], 'Barcelone', 'Espagne', 'high', 4.7, 421, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3', true);