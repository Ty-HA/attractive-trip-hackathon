import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0 gap-4">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-6 text-sm text-muted-foreground">
            <Link 
              to="/cgu" 
              className="hover:text-primary transition-colors whitespace-nowrap"
            >
              {t('footer.cgu')}
            </Link>
            <Link 
              to="/cgv" 
              className="hover:text-primary transition-colors whitespace-nowrap"
            >
              {t('footer.cgv')}
            </Link>
            <Link 
              to="/mentions-legales" 
              className="hover:text-primary transition-colors whitespace-nowrap"
            >
              {t('footer.legal')}
            </Link>
            <Link 
              to="/politique-cookies" 
              className="hover:text-primary transition-colors whitespace-nowrap"
            >
              {t('footer.cookies')}
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-sm text-muted-foreground text-center">
              {t('footer.copyright')}
            </div>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;