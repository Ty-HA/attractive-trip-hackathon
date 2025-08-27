import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Star, Calendar, Filter, ArrowLeft, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import destinationSantorini from "@/assets/destination-santorini.jpg";
import destinationBali from "@/assets/destination-bali.jpg";
import destinationKyoto from "@/assets/destination-kyoto.jpg";

const Destinations = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");

  const destinations = [
    {
      id: 1,
      name: t('destinations.santorini.name'),
      slug: "santorini-grece",
      country: t('countries.greece'),
      continent: "europe",
      price: `${t('common.from')} 899${t('common.currency')}`,
      rating: 4.9,
      duration: `7 ${t('common.days')}`,
      bestSeason: "spring",
      image: destinationSantorini,
      description: t('destinations.santorini.description'),
      highlights: ["Architecture cyclades", "Vins locaux", "Plages volcaniques"]
    },
    {
      id: 2,
      name: t('destinations.bali.name'),
      slug: "bali-indonesie",
      country: t('countries.indonesia'),
      continent: "asia",
      price: `${t('common.from')} 1299${t('common.currency')}`,
      rating: 4.8,
      duration: `10 ${t('common.days')}`,
      bestSeason: "summer",
      image: destinationBali,
      description: t('destinations.bali.description'),
      highlights: ["Temples hindous", "Rizières en terrasse", "Yoga & wellness"]
    },
    {
      id: 3,
      name: t('destinations.kyoto.name'),
      slug: "kyoto-japon",
      country: t('countries.japan'),
      continent: "asia",
      price: `${t('common.from')} 1599${t('common.currency')}`,
      rating: 4.9,
      duration: `8 ${t('common.days')}`,
      bestSeason: "autumn",
      image: destinationKyoto,
      description: t('destinations.kyoto.description'),
      highlights: ["Temples bouddhistes", "Geishas", "Jardins japonais"]
    },
    {
      id: 4,
      name: t('destinations.marrakech.name'),
      slug: "marrakech-maroc",
      country: t('countries.morocco'),
      continent: "africa",
      price: `${t('common.from')} 699${t('common.currency')}`,
      rating: 4.7,
      duration: `6 ${t('common.days')}`,
      bestSeason: "winter",
      image: destinationSantorini,
      description: t('destinations.marrakech.description'),
      highlights: ["Médina historique", "Palais royaux", "Cuisine épicée"]
    },
    {
      id: 5,
      name: t('destinations.newyork.name'),
      slug: "new-york-usa",
      country: t('countries.usa'),
      continent: "america",
      price: `${t('common.from')} 1899${t('common.currency')}`,
      rating: 4.6,
      duration: `5 ${t('common.days')}`,
      bestSeason: "autumn",
      image: destinationBali,
      description: t('destinations.newyork.description'),
      highlights: ["Times Square", "Central Park", "Broadway"]
    },
    {
      id: 6,
      name: t('destinations.sydney.name'),
      slug: "sydney-australie",
      country: t('countries.australia'),
      continent: "oceania",
      price: `${t('common.from')} 2299${t('common.currency')}`,
      rating: 4.8,
      duration: `12 ${t('common.days')}`,
      bestSeason: "spring",
      image: destinationKyoto,
      description: t('destinations.sydney.description'),
      highlights: ["Opéra de Sydney", "Harbour Bridge", "Bondi Beach"]
    }
  ];

  const continents = [
    { value: "all", label: t('destinations.filter.all.continents') },
    { value: "europe", label: t('destinations.filter.europe') },
    { value: "asia", label: t('destinations.filter.asia') },
    { value: "africa", label: t('destinations.filter.africa') },
    { value: "america", label: t('destinations.filter.america') },
    { value: "oceania", label: t('destinations.filter.oceania') }
  ];

  const seasons = [
    { value: "all", label: t('destinations.filter.all.seasons') },
    { value: "spring", label: t('destinations.filter.spring') },
    { value: "summer", label: t('destinations.filter.summer') },
    { value: "autumn", label: t('destinations.filter.autumn') },
    { value: "winter", label: t('destinations.filter.winter') }
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
      spring: t('destinations.filter.spring'),
      summer: t('destinations.filter.summer'),
      autumn: t('destinations.filter.autumn'),
      winter: t('destinations.filter.winter')
    };
    return seasonMap[season] || season;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">
            {t('destinations.title')}
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
                  placeholder={t('destinations.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <SelectValue placeholder={t('destinations.filter.continent')} />
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
                  <SelectValue placeholder={t('destinations.filter.season')} />
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
                  <Link to={`/destinations/${destination.slug}`}>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-primary-dark">
                      {t('destinations.discover')}
                    </Button>
                  </Link>
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
              {t('destinations.empty.title')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('destinations.empty.subtitle')}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedContinent("all");
                setSelectedSeason("all");
              }}
            >
              {t('destinations.empty.reset')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;