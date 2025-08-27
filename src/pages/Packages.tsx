import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Star, Calendar, Clock, Users, Filter, ArrowLeft, Heart, Share2, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import destinationSantorini from "@/assets/destination-santorini.jpg";
import destinationBali from "@/assets/destination-bali.jpg";
import destinationKyoto from "@/assets/destination-kyoto.jpg";

const Packages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const packages = [
    {
      id: 1,
      title: "Îles Grecques Authentiques",
      destination: "Grèce",
      continent: "europe",
      country: "greece",
      price: 1299,
      originalPrice: 1599,
      rating: 4.8,
      reviews: 124,
      duration: 8,
      category: "culture",
      bestSeason: "spring",
      groupSize: "8-16",
      image: destinationSantorini,
      description: "Découvrez Santorin, Mykonos et Naxos dans un voyage authentique",
      highlights: [
        "3 îles emblématiques",
        "Dégustation de vins",
        "Couchers de soleil légendaires",
        "Villages traditionnels"
      ],
      included: ["Vols", "Hôtels 4*", "Petit-déjeuner", "Guide local"],
      itinerary: [
        { day: 1, title: "Arrivée à Santorin", description: "Installation et visite d'Oia" },
        { day: 2, title: "Exploration de Santorin", description: "Vignobles et villages perchés" },
        { day: 3, title: "Ferry vers Mykonos", description: "Découverte du port et des moulins" }
      ]
    },
    {
      id: 2,
      title: "Bali Spirituel & Détente",
      destination: "Indonésie",
      continent: "asia",
      country: "indonesia",
      price: 1599,
      originalPrice: 1899,
      rating: 4.9,
      reviews: 89,
      duration: 12,
      category: "wellness",
      bestSeason: "summer",
      groupSize: "6-12",
      image: destinationBali,
      description: "Temples sacrés, rizières en terrasse et retraites yoga",
      highlights: [
        "Temples d'Ubud",
        "Rizières de Jatiluwih",
        "Sessions yoga quotidiennes",
        "Massages balinais"
      ],
      included: ["Vols", "Villas avec piscine", "Tous repas", "Cours de yoga"],
      itinerary: [
        { day: 1, title: "Arrivée à Ubud", description: "Installation en villa de charme" },
        { day: 2, title: "Temples et artisanat", description: "Visite des temples ancestraux" },
        { day: 3, title: "Rizières et yoga", description: "Randonnée et méditation" }
      ]
    },
    {
      id: 3,
      title: "Japon Traditionnel",
      destination: "Japon",
      continent: "asia",
      country: "japan",
      price: 2199,
      originalPrice: 2599,
      rating: 4.9,
      reviews: 156,
      duration: 10,
      category: "culture",
      bestSeason: "autumn",
      groupSize: "10-18",
      image: destinationKyoto,
      description: "De Tokyo à Kyoto, immersion dans la culture nippone",
      highlights: [
        "Temples de Kyoto",
        "Quartier des geishas",
        "Cérémonie du thé",
        "Shinkansen"
      ],
      included: ["Vols", "Ryokans et hôtels", "JR Pass", "Guide expert"],
      itinerary: [
        { day: 1, title: "Tokyo moderne", description: "Shibuya et temples urbains" },
        { day: 2, title: "Mont Fuji", description: "Excursion vers le mont sacré" },
        { day: 3, title: "Route vers Kyoto", description: "Shinkansen et première découverte" }
      ]
    },
    {
      id: 4,
      title: "Safari Tanzanie Premium",
      destination: "Tanzanie",
      continent: "africa",
      country: "tanzania",
      price: 3299,
      originalPrice: 3899,
      rating: 4.7,
      reviews: 67,
      duration: 9,
      category: "adventure",
      bestSeason: "winter",
      groupSize: "4-8",
      image: destinationBali, // Placeholder
      description: "Serengeti, Ngorongoro et Zanzibar - Safari de luxe",
      highlights: [
        "Big Five garantis",
        "Lodges de luxe",
        "Migration des gnous",
        "Plages de Zanzibar"
      ],
      included: ["Vols internes", "Lodges 5*", "Tous repas", "Guide safari"],
      itinerary: [
        { day: 1, title: "Arusha National Park", description: "Premier contact avec la faune" },
        { day: 2, title: "Serengeti", description: "Immersion dans la savane" },
        { day: 3, title: "Ngorongoro", description: "Cratère aux mille animaux" }
      ]
    },
    {
      id: 5,
      title: "Road Trip Ouest Américain",
      destination: "États-Unis",
      continent: "america",
      country: "usa",
      price: 2599,
      originalPrice: 2999,
      rating: 4.6,
      reviews: 203,
      duration: 14,
      category: "adventure",
      bestSeason: "autumn",
      groupSize: "8-16",
      image: destinationKyoto, // Placeholder
      description: "De Las Vegas au Grand Canyon, parcs nationaux mythiques",
      highlights: [
        "Grand Canyon",
        "Monument Valley",
        "Route 66",
        "Parcs nationaux"
      ],
      included: ["Vols", "Minibus", "Hôtels", "Entrées parcs"],
      itinerary: [
        { day: 1, title: "Las Vegas", description: "Arrivée dans la ville du jeu" },
        { day: 2, title: "Grand Canyon", description: "Lever de soleil mythique" },
        { day: 3, title: "Monument Valley", description: "Paysages de western" }
      ]
    },
    {
      id: 6,
      title: "Australie Sauvage",
      destination: "Australie",
      continent: "oceania",
      country: "australia",
      price: 3599,
      originalPrice: 4199,
      rating: 4.8,
      reviews: 92,
      duration: 16,
      category: "adventure",
      bestSeason: "spring",
      groupSize: "6-14",
      image: destinationSantorini, // Placeholder
      description: "Sydney, Uluru et Grande Barrière de Corail",
      highlights: [
        "Opéra de Sydney",
        "Uluru au coucher",
        "Plongée corail",
        "Faune unique"
      ],
      included: ["Vols", "Hôtels", "Excursions", "Équipement plongée"],
      itinerary: [
        { day: 1, title: "Sydney", description: "Harbour Bridge et Opéra" },
        { day: 2, title: "Blue Mountains", description: "Eucalyptus et koalas" },
        { day: 3, title: "Vol vers Cairns", description: "Porte de la Grande Barrière" }
      ]
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

  const countries = [
    { value: "all", label: "Tous les pays" },
    { value: "greece", label: "Grèce", continent: "europe" },
    { value: "indonesia", label: "Indonésie", continent: "asia" },
    { value: "japan", label: "Japon", continent: "asia" },
    { value: "tanzania", label: "Tanzanie", continent: "africa" },
    { value: "usa", label: "États-Unis", continent: "america" },
    { value: "australia", label: "Australie", continent: "oceania" }
  ];

  const seasons = [
    { value: "all", label: "Toute l'année" },
    { value: "spring", label: "Printemps" },
    { value: "summer", label: "Été" },
    { value: "autumn", label: "Automne" },
    { value: "winter", label: "Hiver" }
  ];

  const durations = [
    { value: "all", label: "Toutes durées" },
    { value: "short", label: "1-7 jours" },
    { value: "medium", label: "8-14 jours" },
    { value: "long", label: "15+ jours" }
  ];

  const categories = [
    { value: "all", label: "Tous les types" },
    { value: "culture", label: "Culture & Histoire" },
    { value: "adventure", label: "Aventure" },
    { value: "wellness", label: "Bien-être" },
    { value: "luxury", label: "Luxe" },
    { value: "family", label: "Famille" }
  ];

  const filteredPackages = packages.filter(pkg => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Location filters
    const matchesContinent = selectedContinent === "all" || pkg.continent === selectedContinent;
    const matchesCountry = selectedCountry === "all" || pkg.country === selectedCountry;
    
    // Season filter
    const matchesSeason = selectedSeason === "all" || pkg.bestSeason === selectedSeason;
    
    // Category filter
    const matchesCategory = selectedCategory === "all" || pkg.category === selectedCategory;
    
    // Duration filter
    let matchesDuration = selectedDuration === "all";
    if (selectedDuration === "short") {
      matchesDuration = pkg.duration >= 1 && pkg.duration <= 7;
    } else if (selectedDuration === "medium") {
      matchesDuration = pkg.duration >= 8 && pkg.duration <= 14;
    } else if (selectedDuration === "long") {
      matchesDuration = pkg.duration >= 15;
    }
    
    return matchesSearch && matchesContinent && matchesCountry && matchesSeason && matchesDuration && matchesCategory;
  });

  const availableCountries = countries.filter(country => 
    selectedContinent === "all" || country.continent === selectedContinent
  );

  const getSeasonLabel = (season: string) => {
    const seasonMap: { [key: string]: string } = {
      spring: "Printemps",
      summer: "Été", 
      autumn: "Automne",
      winter: "Hiver"
    };
    return seasonMap[season] || season;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      culture: "Culture",
      adventure: "Aventure",
      wellness: "Bien-être",
      luxury: "Luxe",
      family: "Famille"
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">
            Voyages organisés
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des itinéraires soigneusement conçus pour vivre des expériences inoubliables en groupe restreint
          </p>
        </div>

        {/* Advanced Filters */}
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un voyage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Filters Row 1 */}
            <Select value={selectedContinent} onValueChange={(value) => {
              setSelectedContinent(value);
              if (value !== "all") {
                setSelectedCountry("all"); // Reset country when continent changes
              }
            }}>
              <SelectTrigger className="h-12">
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

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map(country => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filters Row 2 */}
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="h-12">
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

            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Durée" />
              </SelectTrigger>
              <SelectContent>
                {durations.map(duration => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filters Row 3 */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Type de voyage" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="lg" className="h-12">
              <Filter className="h-5 w-5 mr-2" />
              Plus de filtres
            </Button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedContinent !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {continents.find(c => c.value === selectedContinent)?.label}
                <button onClick={() => setSelectedContinent("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
            {selectedCountry !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {countries.find(c => c.value === selectedCountry)?.label}
                <button onClick={() => setSelectedCountry("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
            {selectedSeason !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {seasons.find(s => s.value === selectedSeason)?.label}
                <button onClick={() => setSelectedSeason("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
            {selectedDuration !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {durations.find(d => d.value === selectedDuration)?.label}
                <button onClick={() => setSelectedDuration("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {categories.find(c => c.value === selectedCategory)?.label}
                <button onClick={() => setSelectedCategory("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {filteredPackages.length} voyage{filteredPackages.length > 1 ? 's' : ''} trouvé{filteredPackages.length > 1 ? 's' : ''}
          </p>
          <Select defaultValue="recommended">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommandés</SelectItem>
              <SelectItem value="price-low">Prix croissant</SelectItem>
              <SelectItem value="price-high">Prix décroissant</SelectItem>
              <SelectItem value="rating">Mieux notés</SelectItem>
              <SelectItem value="duration">Durée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="group hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="relative">
                <div 
                  className="h-64 bg-cover bg-center"
                  style={{ backgroundImage: `url(${pkg.image})` }}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-secondary text-secondary-foreground">
                    {getSeasonLabel(pkg.bestSeason)}
                  </Badge>
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                    {getCategoryLabel(pkg.category)}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm p-2">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm p-2">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                {pkg.originalPrice > pkg.price && (
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-destructive text-destructive-foreground">
                      -{Math.round((1 - pkg.price / pkg.originalPrice) * 100)}%
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-xl">{pkg.title}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-secondary mr-1" fill="currentColor" />
                      <span className="text-sm font-semibold">{pkg.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">({pkg.reviews})</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {pkg.destination}
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {pkg.highlights.slice(0, 3).map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                    {pkg.highlights.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{pkg.highlights.length - 3} autres
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {pkg.duration} jours
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {pkg.groupSize} pers.
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">{pkg.price}€</span>
                      {pkg.originalPrice > pkg.price && (
                        <span className="text-sm text-muted-foreground line-through">{pkg.originalPrice}€</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">par personne</p>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-primary-dark">
                    Voir le voyage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4">
              <Plane className="h-16 w-16 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Aucun voyage trouvé
            </h3>
            <p className="text-muted-foreground mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedContinent("all");
                setSelectedCountry("all");
                setSelectedSeason("all");
                setSelectedDuration("all");
                setSelectedCategory("all");
              }}
            >
              Réinitialiser tous les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;