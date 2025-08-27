import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CGV = () => {
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
            Conditions Générales de Vente
          </h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Objet et champ d'application</h2>
              <p>
                Les présentes conditions générales de vente (CGV) s'appliquent à toutes les prestations 
                de services proposées par Attractive Trip dans le cadre de l'organisation de voyages et 
                de séjours touristiques.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Prix et modalités de paiement</h2>
              <p>
                Les prix sont indiqués en euros toutes taxes comprises. Un acompte de 30% du montant 
                total est requis lors de la réservation, le solde étant dû 30 jours avant le départ. 
                Le paiement s'effectue par carte bancaire ou virement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Réservation et confirmation</h2>
              <p>
                Toute réservation devient ferme et définitive après réception du contrat signé accompagné 
                de l'acompte. Une confirmation écrite sera envoyée dans les 48 heures suivant la réception 
                du dossier complet.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Annulation et modification</h2>
              <p>
                <strong>Annulation par le client :</strong><br/>
                - Plus de 60 jours avant le départ : 10% du montant total<br/>
                - Entre 60 et 30 jours : 25% du montant total<br/>
                - Entre 30 et 15 jours : 50% du montant total<br/>
                - Moins de 15 jours : 100% du montant total
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Assurance voyage</h2>
              <p>
                Il est fortement recommandé de souscrire une assurance voyage couvrant l'annulation, 
                l'interruption de séjour, l'assistance médicale et le rapatriement. Attractive Trip 
                peut proposer des contrats d'assurance adaptés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Responsabilité</h2>
              <p>
                Attractive Trip agit en qualité d'intermédiaire entre les clients et les prestataires 
                de services (hôteliers, transporteurs, etc.). Notre responsabilité est limitée aux 
                prestations que nous organisons directement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Réclamations</h2>
              <p>
                Toute réclamation doit être adressée par écrit à Attractive Trip dans les 8 jours 
                suivant le retour de voyage, accompagnée de tous les justificatifs nécessaires.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Garantie financière</h2>
              <p>
                Attractive Trip est garantie financièrement par [Nom de l'assureur] pour un montant 
                de [montant] euros, permettant le remboursement des fonds versés par les clients.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGV;