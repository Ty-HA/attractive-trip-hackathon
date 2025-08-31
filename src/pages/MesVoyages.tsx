import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Euro, Star, Trash2, Eye, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ArchivedTrip {
  id: string;
  title: string;
  trip_type: string;
  destination_summary: string;
  total_budget: number;
  duration_days: number;
  trip_dates: any;
  preferences: any;
  final_recommendations: any[];
  booking_status: string;
  created_at: string;
  last_accessed_at: string;
  tags: string[];
  is_favorite: boolean;
  notes: string;
}

const MesVoyages = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [trips, setTrips] = useState<ArchivedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'planned' | 'booked' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user, filter]);

  const fetchTrips = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('archived_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('booking_status', filter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error(language === 'fr' ? 'Erreur lors du chargement' : 'Loading error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (tripId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('archived_conversations')
        .update({ is_favorite: !currentStatus })
        .eq('id', tripId);

      if (error) throw error;

      setTrips(prev => prev.map(trip => 
        trip.id === tripId ? { ...trip, is_favorite: !currentStatus } : trip
      ));

      toast.success(language === 'fr' ? 'Favoris mis à jour' : 'Favorites updated');
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast.error(language === 'fr' ? 'Erreur' : 'Error');
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!confirm(language === 'fr' ? 'Supprimer ce voyage ?' : 'Delete this trip?')) return;
    
    try {
      const { error } = await supabase
        .from('archived_conversations')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      toast.success(language === 'fr' ? 'Voyage supprimé' : 'Trip deleted');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error(language === 'fr' ? 'Erreur lors de la suppression' : 'Delete error');
    }
  };

  const viewTripDetails = (trip: ArchivedTrip) => {
    // Open modal or navigate to detailed view
    console.log('View trip details:', trip);
    // For now, just show an alert
    alert(`Détails du voyage: ${trip.title}\n${trip.final_recommendations?.length || 0} recommandations`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planned: { 
        label: language === 'fr' ? 'Planifié' : 'Planned', 
        className: 'bg-blue-100 text-blue-800' 
      },
      booking_started: { 
        label: language === 'fr' ? 'Réservation' : 'Booking', 
        className: 'bg-yellow-100 text-yellow-800' 
      },
      booked: { 
        label: language === 'fr' ? 'Réservé' : 'Booked', 
        className: 'bg-green-100 text-green-800' 
      },
      completed: { 
        label: language === 'fr' ? 'Terminé' : 'Completed', 
        className: 'bg-gray-100 text-gray-800' 
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {language === 'fr' ? 'Connexion requise' : 'Login required'}
        </h1>
        <p className="text-gray-600">
          {language === 'fr' ? 'Connectez-vous pour voir vos voyages sauvegardés' : 'Login to see your saved trips'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'fr' ? 'Mes Voyages' : 'My Trips'}
        </h1>
        <div className="flex gap-2">
          {['all', 'planned', 'booked', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as any)}
            >
              {status === 'all' 
                ? (language === 'fr' ? 'Tous' : 'All')
                : getStatusBadge(status).props.children
              }
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'fr' ? 'Chargement...' : 'Loading...'}
          </p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-xl font-semibold mb-2">
            {language === 'fr' ? 'Aucun voyage sauvegardé' : 'No saved trips'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'fr' 
              ? 'Créez votre premier voyage avec notre assistant intelligent' 
              : 'Create your first trip with our intelligent assistant'
            }
          </p>
          <Button onClick={() => window.location.href = '/'}>
            {language === 'fr' ? 'Créer un voyage' : 'Create a trip'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    {trip.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(trip.id, trip.is_favorite)}
                  >
                    <Heart className={`h-4 w-4 ${trip.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  {getStatusBadge(trip.booking_status)}
                  <span className="text-sm text-gray-500">
                    {formatDate(trip.created_at)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {trip.destination_summary && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="line-clamp-1">{trip.destination_summary}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  {trip.duration_days && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{trip.duration_days} jours</span>
                    </div>
                  )}
                  {trip.total_budget && (
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4 text-gray-500" />
                      <span>{trip.total_budget}€</span>
                    </div>
                  )}
                </div>
                
                {trip.tags && trip.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {trip.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {trip.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{trip.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewTripDetails(trip)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {language === 'fr' ? 'Voir' : 'View'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTrip(trip.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesVoyages;