import Header from "./components/Header";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ConversationalAIProvider } from "@/contexts/ConversationalAIContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import Packages from "./pages/Packages";
import Activities from "./pages/Activities";
import Restaurants from "./pages/Restaurants";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import CGU from "./pages/CGU";
import CGV from "./pages/CGV";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueCookies from "./pages/PolitiqueCookies";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import ConversationalAI from "./components/ConversationalAI";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <ConversationalAIProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                {/* Ajout du Header ici */}
                <Header />
                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/destinations" element={<Destinations />} />
                    <Route path="/destinations/:slug" element={<DestinationDetail />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/restaurants" element={<Restaurants />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/cgu" element={<CGU />} />
                    <Route path="/cgv" element={<CGV />} />
                    <Route path="/mentions-legales" element={<MentionsLegales />} />
                    <Route path="/politique-cookies" element={<PolitiqueCookies />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Footer />
                <CookieBanner />
                <ConversationalAI />
              </div>
            </BrowserRouter>
        </ConversationalAIProvider>
      </LanguageProvider>
    </AuthProvider>
  </TooltipProvider>
</QueryClientProvider>
);

export default App;
