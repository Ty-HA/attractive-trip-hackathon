import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Star, Clock, Users, Filter, ArrowLeft, Heart, Share2, Trophy, Utensils, Mountain, Palette, Waves, Sparkles, Baby, Moon, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import destinationSantorini from "@/assets/destination-santorini.jpg";
import destinationBali from "@/assets/destination-bali.jpg";
import destinationKyoto from "@/assets/destination-kyoto.jpg";

const Activities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [ageRange, setAgeRange] = useState([0, 99]);

  const activities = [
    {
      id: 1,
      title: "Cours de cuisine grecque traditionnelle",
      location: "Santorin, Grèce",
      category: "gastronomie",
      price: 89,
      rating: 4.9,
      reviews: 234,
      duration: "half-day",
      durationHours: 4,
      difficulty: "easy",
      minAge: 12,
      maxGroup: 8,
      image: destinationSantorini,
      description: "Apprenez à préparer des plats authentiques avec une famille locale",
      highlights: [
        "Marché local le matin",
        "Recettes traditionnelles", 
        "Dégustation sur terrasse",
        "Livre de recettes inclus"
      ],
      included: ["Ingrédients", "Tablier", "Recettes", "Repas"],
      provider: "Santorini Cooking",
      featured: true
    },
    {
      id: 2,
      title: "Randonnée au Mont Batur au lever du soleil",
      location: "Bali, Indonésie",
      category: "aventure",
      price: 45,
      rating: 4.7,
      reviews: 567,
      duration: "full-day",
      durationHours: 8,
      difficulty: "moderate",
      minAge: 16,
      maxGroup: 12,
      image: destinationBali,
      description: "Ascension nocturne pour admirer le lever du soleil depuis le sommet",
      highlights: [
        "Départ 2h du matin",
        "Vue panoramique",
        "Petit-déjeuner au sommet",
        "Guide expérimenté"
      ],
      included: ["Transport", "Guide", "Lampes frontales", "Petit-déjeuner"],
      provider: "Bali Adventure",
      featured: false
    },
    {
      id: 3,
      title: "Cérémonie du thé dans un temple zen",
      location: "Kyoto, Japon",
      category: "culture",
      price: 65,
      rating: 4.8,
      reviews: 189,
      duration: "short",
      durationHours: 2,
      difficulty: "easy",
      minAge: 8,
      maxGroup: 6,
      image: destinationKyoto,
      description: "Immersion dans l'art ancestral de la cérémonie du thé japonaise",
      highlights: [
        "Temple authentique",
        "Maître de thé certifié",
        "Gâteaux traditionnels",
        "Kimono optionnel"
      ],
      included: ["Thé matcha", "Pâtisseries", "Explication détaillée"],
      provider: "Kyoto Heritage",
      featured: true
    },
    {
      id: 4,
      title: "Plongée avec les raies manta",
      location: "Nusa Penida, Indonésie",
      category: "sports-nautiques",
      price: 120,
      rating: 4.9,
      reviews: 345,
      duration: "full-day",
      durationHours: 7,
      difficulty: "moderate",
      minAge: 18,
      maxGroup: 8,
      image: destinationBali,
      description: "Rencontrez les majestueuses raies manta dans leur habitat naturel",
      highlights: [
        "2-3 sites de plongée",
        "Raies manta garanties",
        "Équipement professionnel",
        "Instructeur certifié"
      ],
      included: ["Équipement", "Bateau", "Déjeuner", "Assurance"],
      provider: "Manta Dive Center",
      featured: true
    },
    {
      id: 5,
      title: "Massage balinais authentique",
      location: "Ubud, Bali",
      category: "bien-etre",
      price: 35,
      rating: 4.6,
      reviews: 412,
      duration: "short",
      durationHours: 1.5,
      difficulty: "easy",
      minAge: 16,
      maxGroup: 2,
      image: destinationBali,
      description: "Détente absolue avec un massage traditionnel aux huiles essentielles",
      highlights: [
        "Huiles naturelles",
        "Techniques ancestrales",
        "Spa dans la nature",
        "Thé de bienvenue"
      ],
      included: ["Massage 90min", "Huiles", "Thé", "Serviettes"],
      provider: "Sacred Spa Ubud",
      featured: false
    },
    {
      id: 6,
      title: "Safari photo dans le parc national",
      location: "Serengeti, Tanzanie",
      category: "nature",
      price: 280,
      rating: 4.8,
      reviews: 156,
      duration: "full-day",
      durationHours: 10,
      difficulty: "easy",
      minAge: 6,
      maxGroup: 6,
      image: destinationKyoto, // Placeholder
      description: "Capturez la faune sauvage avec un guide photographe professionnel",
      highlights: [
        "Véhicule spécialisé",
        "Guide photographe",
        "Big Five possible",
        "Équipement fourni"
      ],
      included: ["Véhicule 4x4", "Guide expert", "Déjeuner", "Jumelles"],
      provider: "Serengeti Photo Tours",
      featured: false
    },
    {
      id: 7,
      title: "Parc d'attractions Tokyo Disney",
      location: "Tokyo, Japon",
      category: "famille",
      price: 85,
      rating: 4.5,
      reviews: 789,
      duration: "full-day",
      durationHours: 12,
      difficulty: "easy",
      minAge: 0,
      maxGroup: 20,
      image: destinationKyoto,
      description: "Journée magique en famille dans l'univers Disney japonais",
      highlights: [
        "Attractions uniques",
        "Spectacles exclusifs",
        "Fast Pass inclus",
        "Guide francophone"
      ],
      included: ["Entrée parc", "Fast Pass", "Guide", "Plan français"],
      provider: "Tokyo Disney Resort",
      featured: false
    },
    {
      id: 8,
      title: "Tournée des bars à tapas",
      location: "Madrid, Espagne",
      category: "nocturne",
      price: 55,
      rating: 4.7,
      reviews: 298,
      duration: "short",
      durationHours: 4,
      difficulty: "easy",
      minAge: 21,
      maxGroup: 15,
      image: destinationSantorini,
      description: "Découvrez l'authentique culture des tapas dans les meilleurs bars",
      highlights: [
        "5 bars typiques",
        "Tapas traditionnelles",
        "Vins locaux",
        "Ambiance locale"
      ],
      included: ["Tapas", "Boissons", "Guide local", "Déplacements"],
      provider: "Madrid Food Tours",
      featured: false
    }
  ];

  const categories = [
    { value: "all", label: "Toutes les catégories", icon: Filter },
    { value: "aventure", label: "Aventure & Sports", icon: Mountain },
    { value: "culture", label: "Culture & Patrimoine", icon: Palette },
    { value: "gastronomie", label: "Gastronomie", icon: Utensils },
    { value: "nature", label: "Nature & Faune", icon: Sparkles },
    { value: "sports-nautiques", label: "Sports nautiques", icon: Waves },
    { value: "bien-etre", label: "Bien-être & Spa", icon: Trophy },
    { value: "famille", label: "Famille & Enfants", icon: Baby },
    { value: "nocturne", label: "Vie nocturne", icon: Moon }
  ];

  const durations = [
    { value: "all", label: "Toutes durées" },
    { value: "short", label: "1-3 heures" },
    { value: "half-day", label: "Demi-journée" },
    { value: "full-day", label: "Journée complète" }
  ];

  const difficulties = [
    { value: "all", label: "Tous niveaux" },
    { value: "easy", label: "Facile" },
    { value: "moderate", label: "Modéré" },
    { value: "difficult", label: "Difficile" }
  ];

  const locations = [
    { value: "all", label: "Toutes destinations" },
    { value: "greece", label: "Grèce" },
    { value: "indonesia", label: "Indonésie" },
    { value: "japan", label: "Japon" },
    { value: "tanzania", label: "Tanzanie" },
    { value: "spain", label: "Espagne" }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || activity.category === selectedCategory;
    const matchesDuration = selectedDuration === "all" || activity.duration === selectedDuration;
    const matchesDifficulty = selectedDifficulty === "all" || activity.difficulty === selectedDifficulty;
    const matchesPrice = activity.price >= priceRange[0] && activity.price <= priceRange[1];
    const matchesAge = activity.minAge >= ageRange[0] && activity.minAge <= ageRange[1];
    
    let matchesLocation = true;
    if (selectedLocation !== "all") {
      matchesLocation = activity.location.toLowerCase().includes(selectedLocation);
    }
    
    return matchesSearch && matchesCategory && matchesDuration && matchesDifficulty && matchesPrice && matchesAge && matchesLocation;
  });

  const getDifficultyLabel = (difficulty: string) => {
    const difficultyMap: { [key: string]: string } = {
      easy: "Facile",
      moderate: "Modéré",
      difficult: "Difficile"
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colorMap: { [key: string]: string } = {
      easy: "bg-green-100 text-green-800",
      moderate: "bg-yellow-100 text-yellow-800",
      difficult: "bg-red-100 text-red-800"
    };
    return colorMap[difficulty] || "bg-gray-100 text-gray-800";
  };

  const getDurationLabel = (duration: string) => {
    const durationMap: { [key: string]: string } = {
      short: "Courte",
      "half-day": "Demi-journée",
      "full-day": "Journée complète"
    };
    return durationMap[duration] || duration;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">
            Activités & Expériences
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Vivez des moments uniques avec nos activités sélectionnées par des experts locaux
          </p>
        </div>

        {/* Categories Quick Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* Search */}
            <div className="lg:col-span-2 xl:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une activité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Filters Row 1 */}
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

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix (€)</label>
              <div className="px-3">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{priceRange[0]}€</span>
                  <span>{priceRange[1]}€</span>
                </div>
              </div>
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Âge minimum</label>
              <div className="px-3">
                <Slider
                  value={ageRange}
                  onValueChange={setAgeRange}
                  max={99}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{ageRange[0]} ans</span>
                  <span>{ageRange[1] === 99 ? '99+' : ageRange[1]} ans</span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="lg" className="h-12">
              <Filter className="h-5 w-5 mr-2" />
              Plus de filtres
            </Button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {categories.find(c => c.value === selectedCategory)?.label}
                <button onClick={() => setSelectedCategory("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
            {selectedDuration !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {durations.find(d => d.value === selectedDuration)?.label}
                <button onClick={() => setSelectedDuration("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
            {selectedDifficulty !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {difficulties.find(d => d.value === selectedDifficulty)?.label}
                <button onClick={() => setSelectedDifficulty("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
            {selectedLocation !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                {locations.find(l => l.value === selectedLocation)?.label}
                <button onClick={() => setSelectedLocation("all")} className="ml-2 hover:text-destructive">×</button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {filteredActivities.length} activité{filteredActivities.length > 1 ? 's' : ''} trouvée{filteredActivities.length > 1 ? 's' : ''}
          </p>
          <Select defaultValue="featured">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Recommandées</SelectItem>
              <SelectItem value="price-low">Prix croissant</SelectItem>
              <SelectItem value="price-high">Prix décroissant</SelectItem>
              <SelectItem value="rating">Mieux notées</SelectItem>
              <SelectItem value="duration">Durée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className={`group hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden ${activity.featured ? 'ring-2 ring-secondary/20' : ''}`}>
              <div className="relative">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${activity.image})` }}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={getDifficultyColor(activity.difficulty)}>
                    {getDifficultyLabel(activity.difficulty)}
                  </Badge>
                  {activity.featured && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      Recommandée
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm p-2">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm p-2">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                    {getDurationLabel(activity.duration)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-lg leading-tight">{activity.title}</h3>
                    <div className="flex items-center ml-2">
                      <Star className="h-4 w-4 text-secondary mr-1" fill="currentColor" />
                      <span className="text-sm font-semibold">{activity.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    {activity.location}
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {activity.highlights.slice(0, 2).map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                    {activity.highlights.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{activity.highlights.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {activity.durationHours}h
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Max {activity.maxGroup}
                  </div>
                  <div className="text-xs">
                    {activity.minAge}+ ans
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-primary">{activity.price}€</span>
                    <p className="text-xs text-muted-foreground">par personne</p>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary-dark">
                    Réserver
                  </Button>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Par {activity.provider} • {activity.reviews} avis
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Aucune activité trouvée
            </h3>
            <p className="text-muted-foreground mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedDuration("all");
                setSelectedDifficulty("all");
                setSelectedLocation("all");
                setPriceRange([0, 500]);
                setAgeRange([0, 99]);
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

export default Activities;