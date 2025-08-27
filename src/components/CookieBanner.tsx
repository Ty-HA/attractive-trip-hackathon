import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  const handleManage = () => {
    window.open('/politique-cookies', '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 p-4 md:p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-foreground mb-2">
                {t('cookies.banner.message')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleAccept}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  {t('cookies.banner.accept')}
                </Button>
                <Button 
                  onClick={handleDecline}
                  variant="outline"
                  size="sm"
                >
                  {t('cookies.banner.decline')}
                </Button>
                <Button 
                  onClick={handleManage}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t('cookies.banner.manage')}
                </Button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleDecline}
            variant="ghost"
            size="sm"
            className="self-start md:self-center p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;