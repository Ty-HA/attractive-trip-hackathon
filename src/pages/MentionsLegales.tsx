import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const MentionsLegales = () => {
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
            Mentions Légales
          </h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Éditeur du site</h2>
              <p>
                <strong>Attractive Trip</strong><br/>
                Société par Actions Simplifiée au capital de [montant] euros<br/>
                Siège social : [Adresse complète]<br/>
                RCS : [Numéro RCS]<br/>
                SIRET : [Numéro SIRET]<br/>
                TVA Intracommunautaire : [Numéro TVA]<br/>
                Licence d'agent de voyage : [Numéro de licence]<br/>
                Email : contact@attractive-trip.com<br/>
                Téléphone : [Numéro de téléphone]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Directeur de la publication</h2>
              <p>
                [Nom du directeur de la publication]<br/>
                En sa qualité de [Fonction dans l'entreprise]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Hébergement</h2>
              <p>
                Le site web est hébergé par :<br/>
                [Nom de l'hébergeur]<br/>
                [Adresse de l'hébergeur]<br/>
                Téléphone : [Numéro de téléphone de l'hébergeur]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Conception et réalisation</h2>
              <p>
                Le site web a été conçu et développé par l'équipe Attractive Trip.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Propriété intellectuelle</h2>
              <p>
                L'ensemble du contenu de ce site web (textes, images, vidéos, logos, icônes, sons, 
                logiciels) est la propriété exclusive d'Attractive Trip, sauf mention contraire. 
                Toute reproduction, représentation, modification, publication, transmission, ou 
                dénaturation, totale ou partielle, est strictement interdite sans autorisation 
                écrite préalable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Protection des données personnelles</h2>
              <p>
                Conformément à la loi n°78-17 du 6 janvier 1978 modifiée relative à l'informatique, 
                aux fichiers et aux libertés et au Règlement Général sur la Protection des Données 
                (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de 
                portabilité de vos données personnelles. Pour exercer ces droits, contactez-nous à : 
                privacy@attractive-trip.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Cookies</h2>
              <p>
                Ce site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des 
                statistiques de visite. Vous pouvez configurer vos préférences de cookies à tout 
                moment depuis les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Limitation de responsabilité</h2>
              <p>
                Attractive Trip s'efforce d'assurer l'exactitude et la mise à jour des informations 
                diffusées sur ce site. Toutefois, des erreurs ou omissions peuvent survenir. 
                L'utilisateur assume la responsabilité de l'usage qu'il fait des informations et 
                contenus présents sur le site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Droit applicable</h2>
              <p>
                Les présentes mentions légales sont soumises au droit français. En cas de litige, 
                les tribunaux français seront seuls compétents.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;