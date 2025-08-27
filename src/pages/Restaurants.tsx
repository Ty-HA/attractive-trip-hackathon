import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, MapPin, Euro, Users, ChefHat, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisine_type: string;
  specialties: string[];
  city: string;
  country: string;
  price_range: string; // Changed from union type to string
  rating: number;
  review_count: number;
  featured_image_url: string;
  is_featured: boolean;
}

interface Destination {
  id: string;
  title: string;
  country: string;
}

interface Package {
  id: string;
  title: string;
}

interface Activity {
  id: string;
  title: string;
}

interface Filters {
  search: string;
  destination: string;
  cuisine: string;
  priceRange: string;
  package: string;
  activity: string;
  rating: string;
}

const Restaurants = () => {
  const { t } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    destination: '',
    cuisine: '',
    priceRange: '',
    package: '',
    activity: '',
    rating: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch restaurants
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false });

      // Fetch destinations
      const { data: destinationsData } = await supabase
        .from('destinations')
        .select('id, title, country')
        .eq('is_published', true);

      // Fetch packages
      const { data: packagesData } = await supabase
        .from('packages')
        .select('id, title')
        .eq('is_available', true);

      // Fetch activities
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('id, title')
        .eq('is_available', true);

      setRestaurants(restaurantsData || []);
      setDestinations(destinationsData || []);
      setPackages(packagesData || []);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      // Search filter
      if (filters.search && !restaurant.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !restaurant.city.toLowerCase().includes(filters.search.toLowerCase()) &&
          !restaurant.cuisine_type.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Destination filter (by country or city)
      if (filters.destination) {
        const selectedDestination = destinations.find(d => d.id === filters.destination);
        if (selectedDestination && restaurant.country !== selectedDestination.country) {
          return false;
        }
      }

      // Cuisine filter
      if (filters.cuisine && restaurant.cuisine_type !== filters.cuisine) {
        return false;
      }

      // Price range filter
      if (filters.priceRange && restaurant.price_range !== filters.priceRange) {
        return false;
      }

      // Rating filter
      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        if (restaurant.rating < minRating) {
          return false;
        }
      }

      return true;
    });
  }, [restaurants, filters, destinations]);

  const clearFilters = () => {
    setFilters({
      search: '',
      destination: '',
      cuisine: '',
      priceRange: '',
      package: '',
      activity: '',
      rating: ''
    });
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getPriceDisplay = (priceRange: string) => {
    switch (priceRange) {
      case 'budget': return '€';
      case 'medium': return '€€';
      case 'high': return '€€€';
      case 'luxury': return '€€€€';
      default: return '€€';
    }
  };

  const cuisineTypes = [...new Set(restaurants.map(r => r.cuisine_type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">Chargement des restaurants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Restaurants & Gastronomie
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les meilleurs restaurants du monde entier. Savourez des spécialités locales et vivez des expériences culinaires inoubliables.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Rechercher un restaurant, une ville, une cuisine..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 h-14 text-lg"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="text-center mt-6">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="lg"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </div>
      </section>

      {/* Advanced Filters */}
      {showFilters && (
        <section className="py-6 px-6 bg-accent/20 border-b">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Destination
                </label>
                <Select value={filters.destination} onValueChange={(value) => updateFilter('destination', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les destinations" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="">Toutes les destinations</SelectItem>
                    {destinations.map((destination) => (
                      <SelectItem key={destination.id} value={destination.id}>
                        {destination.title}, {destination.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type de cuisine
                </label>
                <Select value={filters.cuisine} onValueChange={(value) => updateFilter('cuisine', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les cuisines" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="">Toutes les cuisines</SelectItem>
                    {cuisineTypes.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gamme de prix
                </label>
                <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les prix" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="">Tous les prix</SelectItem>
                    <SelectItem value="budget">€ - Budget</SelectItem>
                    <SelectItem value="medium">€€ - Moyen</SelectItem>
                    <SelectItem value="high">€€€ - Élevé</SelectItem>
                    <SelectItem value="luxury">€€€€ - Luxe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Note minimum
                </label>
                <Select value={filters.rating} onValueChange={(value) => updateFilter('rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les notes" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="">Toutes les notes</SelectItem>
                    <SelectItem value="4.5">4.5+ étoiles</SelectItem>
                    <SelectItem value="4.0">4.0+ étoiles</SelectItem>
                    <SelectItem value="3.5">3.5+ étoiles</SelectItem>
                    <SelectItem value="3.0">3.0+ étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-center">
              <Button onClick={clearFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              {filteredRestaurants.length} restaurant{filteredRestaurants.length > 1 ? 's' : ''} trouvé{filteredRestaurants.length > 1 ? 's' : ''}
            </h2>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <ChefHat className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">Aucun restaurant trouvé</h3>
              <p className="text-muted-foreground mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <Button onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="group hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className="relative">
                    <div 
                      className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundImage: `url(${restaurant.featured_image_url})` }}
                    />
                    {restaurant.is_featured && (
                      <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                        Recommandé
                      </Badge>
                    )}
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                      {getPriceDisplay(restaurant.price_range)}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">
                          {restaurant.name}
                        </CardTitle>
                        <div className="flex items-center text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{restaurant.city}, {restaurant.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        <Star className="h-4 w-4 text-secondary mr-1" fill="currentColor" />
                        <span className="text-sm font-semibold">{restaurant.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({restaurant.review_count})</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>
                    
                    <div className="flex items-center mb-3">
                      <ChefHat className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium text-primary">{restaurant.cuisine_type}</span>
                    </div>

                    {restaurant.specialties && restaurant.specialties.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Spécialités :</p>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {restaurant.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{restaurant.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator className="mb-4" />

                    <div className="flex justify-between items-center">
                      <Button className="flex-1 mr-2">
                        Voir les détails
                      </Button>
                      <Button variant="outline">
                        Réserver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Restaurants;