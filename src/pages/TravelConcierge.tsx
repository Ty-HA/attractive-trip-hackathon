import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TravelConciergeComponent from '@/components/TravelConcierge';

const TravelConciergePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Travel Concierge IA
            </h1>
            <p className="text-lg text-muted-foreground">
              Votre assistant personnel pour planifier le voyage parfait
            </p>
          </div>
        </div>
        
        <TravelConciergeComponent />
      </div>
    </div>
  );
};

export default TravelConciergePage;