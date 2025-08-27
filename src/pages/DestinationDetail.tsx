import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  Camera,
  Check,
  X,
  Map,
  Info,
  Heart,
  Share2
} from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

interface Destination {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  long_description?: string;
  country: string;
  continent: string;
  featured_image_url?: string;
  gallery_images?: string[];
  price_from?: number;
  best_season?: string;
  duration_days?: number;
  max_group_size?: number;
  difficulty_level?: string;
  highlights?: string[];
  included_services?: string[];
  excluded_services?: string[];
  itinerary?: any;
  practical_info?: any;
  is_published: boolean;
  is_featured: boolean;
}

interface Package {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  duration_days: number;
  group_size_min: number;
  group_size_max?: number;
  category?: string;
  difficulty?: string;
  highlights?: string[];
  included_services?: string[];
}

const DestinationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchDestination();
    }
  }, [slug]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      
      // Fetch destination
      const { data: destinationData, error: destinationError } = await supabase
        .from('destinations')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (destinationError) {
        setError('Destination non trouvée');
        return;
      }

      setDestination(destinationData);

      // Fetch related packages
      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .eq('destination_id', destinationData.id)
        .eq('is_available', true);

      setPackages(packagesData || []);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    const labels: { [key: string]: string } = {
      easy: 'Facile',
      moderate: 'Modéré',
      difficult: 'Difficile'
    };
    return labels[difficulty || 'easy'] || 'Facile';
  };

  const getSeasonLabel = (season?: string) => {
    const labels: { [key: string]: string } = {
      spring: 'Printemps',
      summer: 'Été',
      autumn: 'Automne',
      winter: 'Hiver'
    };
    return labels[season || ''] || season;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="bg-muted h-96 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              <div className="bg-muted h-8 w-3/4 rounded"></div>
              <div className="bg-muted h-4 w-1/2 rounded"></div>
              <div className="bg-muted h-20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Destination non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            La destination que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link to="/destinations">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux destinations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" 
           style={{ backgroundImage: `url(${destination.featured_image_url})` }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <Link to="/destinations" className="inline-flex items-center text-white hover:text-white/80 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux destinations
            </Link>
            <h1 className="text-5xl font-display font-bold text-white mb-2">
              {destination.title}
            </h1>
            {destination.subtitle && (
              <p className="text-xl text-white/90 mb-4">{destination.subtitle}</p>
            )}
            <div className="flex items-center space-x-4 text-white/90">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {destination.country}
              </div>
              {destination.duration_days && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {destination.duration_days} jours
                </div>
              )}
              {destination.max_group_size && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Max {destination.max_group_size} pers.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="itinerary">Itinéraire</TabsTrigger>
                <TabsTrigger value="included">Inclus/Exclus</TabsTrigger>
                <TabsTrigger value="practical">Infos pratiques</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-lg text-muted-foreground mb-6">
                    {destination.description}
                  </p>
                  
                  {destination.long_description && (
                    <div className="text-foreground" 
                         dangerouslySetInnerHTML={{ __html: destination.long_description }} />
                  )}
                  
                  {destination.highlights && destination.highlights.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">Points forts</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {destination.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center">
                            <Star className="h-4 w-4 text-secondary mr-2" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="itinerary" className="mt-6">
                {destination.itinerary ? (
                  <div className="space-y-6">
                    {/* Render itinerary from JSON */}
                    <p className="text-muted-foreground">
                      L'itinéraire détaillé sera bientôt disponible.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    L'itinéraire détaillé sera bientôt disponible.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="included" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {destination.included_services && destination.included_services.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-green-600">
                        <Check className="h-5 w-5 inline mr-2" />
                        Inclus
                      </h3>
                      <ul className="space-y-2">
                        {destination.included_services.map((service, index) => (
                          <li key={index} className="flex items-center">
                            <Check className="h-4 w-4 text-green-600 mr-2" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {destination.excluded_services && destination.excluded_services.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-600">
                        <X className="h-5 w-5 inline mr-2" />
                        Non inclus
                      </h3>
                      <ul className="space-y-2">
                        {destination.excluded_services.map((service, index) => (
                          <li key={index} className="flex items-center">
                            <X className="h-4 w-4 text-red-600 mr-2" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="practical" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        Informations générales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {destination.best_season && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Meilleure saison:</span>
                          <span>{getSeasonLabel(destination.best_season)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Niveau de difficulté:</span>
                        <Badge variant="outline">
                          {getDifficultyLabel(destination.difficulty_level)}
                        </Badge>
                      </div>
                      {destination.max_group_size && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taille max du groupe:</span>
                          <span>{destination.max_group_size} personnes</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Map className="h-5 w-5 mr-2" />
                        Localisation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p><strong>Pays:</strong> {destination.country}</p>
                      <p><strong>Continent:</strong> {destination.continent}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Réserver ce voyage</CardTitle>
                {destination.price_from && (
                  <div className="text-2xl font-bold text-primary">
                    À partir de {destination.price_from}€
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      par personne
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Button size="lg" className="w-full">
                  Demander un devis
                </Button>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart className="h-4 w-4 mr-1" />
                    Favoris
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-1" />
                    Partager
                  </Button>
                </div>
                
                <Separator />
                
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">🎯 Satisfaction garantie</p>
                  <p className="mb-2">✈️ Annulation flexible</p>
                  <p>👥 Groupe réduit</p>
                </div>
              </CardContent>
            </Card>

            {/* Available Packages */}
            {packages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Formules disponibles</CardTitle>
                  <CardDescription>
                    Choisissez la formule qui vous convient
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{pkg.title}</h4>
                        <div className="text-right">
                          <div className="font-bold text-primary">{pkg.price}€</div>
                          {pkg.original_price && pkg.original_price > pkg.price && (
                            <div className="text-sm text-muted-foreground line-through">
                              {pkg.original_price}€
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {pkg.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {pkg.duration_days} jours
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {pkg.group_size_min}-{pkg.group_size_max || pkg.group_size_min} pers.
                        </span>
                      </div>
                      
                      <Button size="sm" className="w-full mt-3">
                        Choisir cette formule
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;