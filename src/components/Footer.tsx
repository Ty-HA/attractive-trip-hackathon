import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <Link 
              to="/cgu" 
              className="hover:text-primary transition-colors"
            >
              Conditions Générales d'Utilisation
            </Link>
            <Link 
              to="/cgv" 
              className="hover:text-primary transition-colors"
            >
              Conditions Générales de Vente
            </Link>
            <Link 
              to="/mentions-legales" 
              className="hover:text-primary transition-colors"
            >
              Mentions Légales
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2025 Attractive Trip. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;