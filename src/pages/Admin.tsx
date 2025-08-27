import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  MapPin, 
  Package, 
  Activity, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Destination {
  id: string;
  title: string;
  country: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

interface Package {
  id: string;
  title: string;
  price: number;
  duration_days: number;
  is_available: boolean;
  is_featured: boolean;
  destination?: { title: string };
}

interface Activity {
  id: string;
  title: string;
  price: number;
  category: string;
  is_available: boolean;
  is_featured: boolean;
  destination?: { title: string };
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('destinations');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    // Fetch destinations
    const { data: destinationsData } = await supabase
      .from('destinations')
      .select('id, title, country, is_published, is_featured, created_at')
      .order('created_at', { ascending: false });
    
    setDestinations(destinationsData || []);

    // Fetch packages with destination info
    const { data: packagesData } = await supabase
      .from('packages')
      .select(`
        id, title, price, duration_days, is_available, is_featured,
        destinations(title)
      `)
      .order('created_at', { ascending: false });
    
    setPackages(packagesData || []);

    // Fetch activities with destination info
    const { data: activitiesData } = await supabase
      .from('activities')
      .select(`
        id, title, price, category, is_available, is_featured,
        destinations(title)
      `)
      .order('created_at', { ascending: false });
    
    setActivities(activitiesData || []);
  };

  const togglePublishDestination = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('destinations')
      .update({ is_published: !currentStatus })
      .eq('id', id);
    
    fetchData();
  };

  const toggleAvailablePackage = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('packages')
      .update({ is_available: !currentStatus })
      .eq('id', id);
    
    fetchData();
  };

  const toggleAvailableActivity = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('activities')
      .update({ is_available: !currentStatus })
      .eq('id', id);
    
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Administration
            </h1>
            <p className="text-lg text-muted-foreground">
              Gérez vos destinations, voyages et activités
            </p>
          </div>
          
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="destinations" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Destinations
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Voyages
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Activités
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="destinations" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Destinations</CardTitle>
                    <CardDescription>
                      Gérez vos destinations de voyage
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle destination
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {destinations.map((destination) => (
                    <div key={destination.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{destination.title}</h3>
                        <p className="text-sm text-muted-foreground">{destination.country}</p>
                        <div className="flex space-x-2 mt-2">
                          <Badge variant={destination.is_published ? "default" : "secondary"}>
                            {destination.is_published ? "Publié" : "Brouillon"}
                          </Badge>
                          {destination.is_featured && (
                            <Badge variant="outline">En vedette</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => togglePublishDestination(destination.id, destination.is_published)}
                        >
                          {destination.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {destinations.length === 0 && (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucune destination créée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Voyages organisés</CardTitle>
                    <CardDescription>
                      Gérez vos offres de voyages
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau voyage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{pkg.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pkg.destination?.title} • {pkg.duration_days} jours
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="font-semibold text-primary">{pkg.price}€</span>
                          <Badge variant={pkg.is_available ? "default" : "secondary"}>
                            {pkg.is_available ? "Disponible" : "Indisponible"}
                          </Badge>
                          {pkg.is_featured && (
                            <Badge variant="outline">En vedette</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleAvailablePackage(pkg.id, pkg.is_available)}
                        >
                          {pkg.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {packages.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucun voyage créé</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Activités</CardTitle>
                    <CardDescription>
                      Gérez vos activités proposées
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle activité
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.destination?.title} • {activity.category}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="font-semibold text-primary">{activity.price}€</span>
                          <Badge variant={activity.is_available ? "default" : "secondary"}>
                            {activity.is_available ? "Disponible" : "Indisponible"}
                          </Badge>
                          {activity.is_featured && (
                            <Badge variant="outline">En vedette</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleAvailableActivity(activity.id, activity.is_available)}
                        >
                          {activity.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {activities.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucune activité créée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Gérez les utilisateurs et leurs rôles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Fonctionnalité à venir</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;