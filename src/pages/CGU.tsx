import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CGU = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">
            Conditions Générales d'Utilisation
          </h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Objet</h2>
              <p>
                Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de la plateforme 
                Attractive Trip, accessible à l'adresse [URL du site]. L'utilisation de nos services implique 
                l'acceptation pleine et entière des présentes CGU.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Définitions</h2>
              <p>
                « Utilisateur » : toute personne physique ou morale utilisant les services d'Attractive Trip.<br/>
                « Services » : ensemble des fonctionnalités proposées par la plateforme Attractive Trip.<br/>
                « Plateforme » : le site web et l'application Attractive Trip.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Accès aux services</h2>
              <p>
                L'accès aux services d'Attractive Trip est gratuit pour la consultation. Certains services 
                peuvent nécessiter une inscription préalable et être soumis à des conditions tarifaires 
                spécifiques.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Utilisation de la plateforme</h2>
              <p>
                L'utilisateur s'engage à utiliser la plateforme conformément à sa destination et aux 
                présentes CGU. Il s'interdit notamment de porter atteinte aux droits de tiers ou à 
                l'ordre public.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Propriété intellectuelle</h2>
              <p>
                Tous les éléments de la plateforme (textes, images, vidéos, logos, etc.) sont protégés 
                par les droits de propriété intellectuelle et appartiennent à Attractive Trip ou à ses 
                partenaires.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Responsabilité</h2>
              <p>
                Attractive Trip ne saurait être tenu responsable des dommages directs ou indirects 
                résultant de l'utilisation de la plateforme, sauf en cas de faute lourde ou intentionnelle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Modification des CGU</h2>
              <p>
                Attractive Trip se réserve le droit de modifier les présentes CGU à tout moment. 
                Les nouvelles conditions seront applicables dès leur publication sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Droit applicable</h2>
              <p>
                Les présentes CGU sont soumises au droit français. Tout litige sera porté devant 
                les tribunaux compétents de Paris.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGU;