import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const Header = () => {
  const { t } = useLanguage();
  
  return (
    <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Attractive Trip
            </h1>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/destinations" className="text-foreground hover:text-primary transition-colors">{t('nav.destinations')}</Link>
            <Link to="/packages" className="text-foreground hover:text-primary transition-colors">{t('nav.packages')}</Link>
            <Link to="/activities" className="text-foreground hover:text-primary transition-colors">{t('nav.activities')}</Link>
            <LanguageSelector />
            <Button variant="outline">Connexion</Button>
            <Button>S'inscrire</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;