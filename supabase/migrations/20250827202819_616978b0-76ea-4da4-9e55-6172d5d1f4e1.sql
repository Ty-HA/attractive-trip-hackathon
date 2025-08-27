-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  long_description TEXT,
  country TEXT NOT NULL,
  continent TEXT NOT NULL,
  featured_image_url TEXT,
  gallery_images TEXT[],
  price_from INTEGER,
  best_season TEXT,
  duration_days INTEGER,
  max_group_size INTEGER,
  difficulty_level TEXT DEFAULT 'easy',
  highlights TEXT[],
  included_services TEXT[],
  excluded_services TEXT[],
  itinerary JSONB,
  practical_info JSONB,
  location_coordinates POINT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create packages table
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  duration_days INTEGER NOT NULL,
  group_size_min INTEGER DEFAULT 1,
  group_size_max INTEGER,
  category TEXT,
  difficulty TEXT DEFAULT 'easy',
  highlights TEXT[],
  included_services TEXT[],
  detailed_itinerary JSONB,
  booking_conditions TEXT,
  cancellation_policy TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  available_dates DATE[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  duration_hours INTEGER,
  duration_type TEXT, -- 'short', 'half-day', 'full-day'
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'easy',
  min_age INTEGER DEFAULT 0,
  max_group_size INTEGER,
  highlights TEXT[],
  included_services TEXT[],
  equipment_provided TEXT[],
  what_to_bring TEXT[],
  meeting_point TEXT,
  provider_name TEXT,
  provider_contact TEXT,
  booking_conditions TEXT,
  cancellation_policy TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  available_times TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS Policies for destinations
CREATE POLICY "Published destinations are viewable by everyone" 
ON public.destinations 
FOR SELECT 
USING (is_published = true OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage destinations" 
ON public.destinations 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS Policies for packages
CREATE POLICY "Available packages are viewable by everyone" 
ON public.packages 
FOR SELECT 
USING (is_available = true OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage packages" 
ON public.packages 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- RLS Policies for activities
CREATE POLICY "Available activities are viewable by everyone" 
ON public.activities 
FOR SELECT 
USING (is_available = true OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage activities" 
ON public.activities 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_destinations_slug ON public.destinations(slug);
CREATE INDEX idx_destinations_continent ON public.destinations(continent);
CREATE INDEX idx_destinations_country ON public.destinations(country);
CREATE INDEX idx_destinations_published ON public.destinations(is_published);
CREATE INDEX idx_destinations_featured ON public.destinations(is_featured);

CREATE INDEX idx_packages_slug ON public.packages(slug);
CREATE INDEX idx_packages_destination ON public.packages(destination_id);
CREATE INDEX idx_packages_available ON public.packages(is_available);
CREATE INDEX idx_packages_category ON public.packages(category);

CREATE INDEX idx_activities_slug ON public.activities(slug);
CREATE INDEX idx_activities_destination ON public.activities(destination_id);
CREATE INDEX idx_activities_category ON public.activities(category);
CREATE INDEX idx_activities_available ON public.activities(is_available);