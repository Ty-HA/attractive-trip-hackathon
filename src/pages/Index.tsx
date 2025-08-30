import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import ConversationalAI from "@/components/ConversationalAI";
import heroImage from "@/assets/hero-beach.jpg";
import categoryLuxury from "@/assets/category-luxury.jpg";
import categoryAdventure from "@/assets/category-adventure.jpg";
import categoryBeach from "@/assets/category-beach.jpg";
import categoryCulture from "@/assets/category-culture.jpg";
import categoryFamily from "@/assets/category-family.jpg";
import categoryEco from "@/assets/category-eco.jpg";
import destinationSantorini from "@/assets/destination-santorini.jpg";
import destinationBali from "@/assets/destination-bali.jpg";
import destinationKyoto from "@/assets/destination-kyoto.jpg";

const Index = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Attractive Trip
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/destinations" className="text-foreground hover:text-primary transition-colors">{t('nav.destinations')}</Link>
              <Link to="/packages" className="text-foreground hover:text-primary transition-colors">{t('nav.packages')}</Link>
              <Link to="/activities" className="text-foreground hover:text-primary transition-colors">{t('nav.activities')}</Link>
              <Link to="/restaurants" className="text-foreground hover:text-primary transition-colors">{t('nav.restaurants')}</Link>
              <LanguageSelector />
              <Button variant="outline">Connexion</Button>
              <Button>S'inscrire</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full window with fixed background */}
      <section 
        className="relative min-h-screen bg-fixed bg-cover bg-center flex flex-col justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/20" />
        
        <div className="relative z-10 px-6 max-w-6xl mx-auto w-full py-20">
          {/* Header */}
          <div className="text-center text-white mb-12">
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Attractive Trip
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Explore more. Plan Less. AI handles the rest.
            </p>
          </div>
          
          {/* AI Chat Container */}
          <div className="w-full max-w-4xl mx-auto">
            <ConversationalAI inline={true} mobile={false} />
          </div>
        </div>
      </section>

      {/* Travel Categories */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-display font-bold text-foreground mb-4">
              {t('categories.title')}
            </h3>
            <p className="text-xl text-muted-foreground">Des voyages pensés pour chaque envie</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: t('categories.luxury'), image: categoryLuxury, description: "Expériences exclusives et raffinées" },
              { title: t('categories.adventure'), image: categoryAdventure, description: "Explorez les merveilles naturelles" },
              { title: t('categories.beach'), image: categoryBeach, description: "Évasion tropicale et bien-être" },
              { title: t('categories.culture'), image: categoryCulture, description: "Immersion dans l'art et l'histoire" },
              { title: t('categories.family'), image: categoryFamily, description: "Aventures pour toute la famille" },
              { title: t('categories.eco'), image: categoryEco, description: "Voyagez en préservant la planète" }
            ].map((category, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-display">{category.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-20 bg-accent/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-display font-bold text-foreground mb-4">
              {t('destinations.title')}
            </h3>
            <p className="text-xl text-muted-foreground">Les coups de cœur de nos voyageurs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Santorini", country: "Grèce", rating: 4.9, price: "À partir de 899€", image: destinationSantorini },
              { name: "Bali", country: "Indonésie", rating: 4.8, price: "À partir de 1299€", image: destinationBali },
              { name: "Kyoto", country: "Japon", rating: 4.9, price: "À partir de 1599€", image: destinationKyoto }
            ].map((destination, index) => (
              <Card key={index} className="group hover:shadow-glow transition-all duration-300 cursor-pointer overflow-hidden">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${destination.image})` }}
                />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-display font-bold text-xl">{destination.name}</h4>
                      <p className="text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {destination.country}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-secondary mr-1" fill="currentColor" />
                      <span className="text-sm font-semibold">{destination.rating}</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-primary">{destination.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;