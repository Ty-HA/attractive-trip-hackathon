import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Star, Calendar, Filter, Plane, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import destinationSantorini from "@/assets/destination-santorini.jpg";
import destinationBali from "@/assets/destination-bali.jpg";
import destinationKyoto from "@/assets/destination-kyoto.jpg";

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");

  const destinations = [
    {
      id: 1,
      name: "Santorini",
      country: "Grèce",
      continent: "europe",
      price: "À partir de 899€",
      rating: 4.9,
      duration: "7 jours",
      bestSeason: "spring",
      image: destinationSantorini,
      description: "Îles grecques aux couchers de soleil légendaires",
      highlights: ["Architecture cyclades", "Vins locaux", "Plages volcaniques"]
    },
    {
      id: 2,
      name: "Bali",
      country: "Indonésie",
      continent: "asia",
      price: "À partir de 1299€",
      rating: 4.8,
      duration: "10 jours",
      bestSeason: "summer",
      image: destinationBali,
      description: "Temples ancestraux et plages paradisiaques",
      highlights: ["Temples hindous", "Rizières en terrasse", "Yoga & wellness"]
    },
    {
      id: 3,
      name: "Kyoto",
      country: "Japon",
      continent: "asia",
      price: "À partir de 1599€",
      rating: 4.9,
      duration: "8 jours",
      bestSeason: "autumn",
      image: destinationKyoto,
      description: "Traditions millénaires et jardins zen",
      highlights: ["Temples bouddhistes", "Geishas", "Jardins japonais"]
    },
    {
      id: 4,
      name: "Marrakech",
      country: "Maroc",
      continent: "africa",
      price: "À partir de 699€",
      rating: 4.7,
      duration: "6 jours",
      bestSeason: "winter",
      image: destinationSantorini, // Placeholder - nous pourrions générer une image spécifique
      description: "Souks colorés et architecture mauresque",
      highlights: ["Médina historique", "Palais royaux", "Cuisine épicée"]
    },
    {
      id: 5,
      name: "New York",
      country: "États-Unis",
      continent: "america",
      price: "À partir de 1899€",
      rating: 4.6,
      duration: "5 jours",
      bestSeason: "autumn",
      image: destinationBali, // Placeholder
      description: "La ville qui ne dort jamais",
      highlights: ["Times Square", "Central Park", "Broadway"]
    },
    {
      id: 6,
      name: "Sydney",
      country: "Australie",
      continent: "oceania",
      price: "À partir de 2299€",
      rating: 4.8,
      duration: "12 jours",
      bestSeason: "spring",
      image: destinationKyoto, // Placeholder
      description: "Opéra iconique et plages urbaines",
      highlights: ["Opéra de Sydney", "Harbour Bridge", "Bondi Beach"]
    }
  ];

  const continents = [
    { value: "all", label: "Tous les continents" },
    { value: "europe", label: "Europe" },
    { value: "asia", label: "Asie" },
    { value: "africa", label: "Afrique" },
    { value: "america", label: "Amérique" },
    { value: "oceania", label: "Océanie" }
  ];

  const seasons = [
    { value: "all", label: "Toute l'année" },
    { value: "spring", label: "Printemps" },
    { value: "summer", label: "Été" },
    { value: "autumn", label: "Automne" },
    { value: "winter", label: "Hiver" }
  ];

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContinent = selectedContinent === "all" || destination.continent === selectedContinent;
    const matchesSeason = selectedSeason === "all" || destination.bestSeason === selectedSeason;
    
    return matchesSearch && matchesContinent && matchesSeason;
  });

  const getSeasonLabel = (season: string) => {
    const seasonMap: { [key: string]: string } = {
      spring: "Printemps",
      summer: "Été", 
      autumn: "Automne",
      winter: "Hiver"
    };
    return seasonMap[season] || season;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5 text-primary" />
                <Plane className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Attractive Trip
                </h1>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">Accueil</Link>
              <a href="#" className="text-primary font-semibold">Destinations</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Voyages</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Activités</a>
              <Button variant="outline">Connexion</Button>
              <Button>S'inscrire</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">
            Découvrez nos destinations
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explorez le monde avec nos voyages sur mesure, des plages paradisiaques aux métropoles vibrantes
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <SelectValue placeholder="Continent" />
                </SelectTrigger>
                <SelectContent>
                  {continents.map(continent => (
                    <SelectItem key={continent.value} value={continent.value}>
                      {continent.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <SelectValue placeholder="Saison idéale" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season.value} value={season.value}>
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="lg" className="h-12 px-6">
                <Filter className="h-5 w-5 mr-2" />
                Filtres
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedContinent !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {continents.find(c => c.value === selectedContinent)?.label}
                <button 
                  onClick={() => setSelectedContinent("all")}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedSeason !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {seasons.find(s => s.value === selectedSeason)?.label}
                <button 
                  onClick={() => setSelectedSeason("all")}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredDestinations.length} destination{filteredDestinations.length > 1 ? 's' : ''} trouvée{filteredDestinations.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination) => (
            <Card key={destination.id} className="group hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden">
              <div 
                className="h-64 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${destination.image})` }}
              >
                <div className="absolute top-4 left-4">
                  <Badge className="bg-secondary text-secondary-foreground">
                    {getSeasonLabel(destination.bestSeason)}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                  <Star className="h-4 w-4 text-secondary mr-1" fill="currentColor" />
                  <span className="text-sm font-semibold">{destination.rating}</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="font-display font-bold text-xl mb-1">{destination.name}</h3>
                  <p className="text-muted-foreground flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {destination.country}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">{destination.description}</p>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {destination.highlights.map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-primary">{destination.price}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {destination.duration}
                    </p>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary-dark">
                    Découvrir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Aucune destination trouvée
            </h3>
            <p className="text-muted-foreground mb-6">
              Essayez de modifier vos critères de recherche ou filtres
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedContinent("all");
                setSelectedSeason("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;