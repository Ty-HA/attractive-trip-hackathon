import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PolitiqueCookies = () => {
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
            Politique de Cookies
          </h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Qu'est-ce qu'un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone 
                lorsque vous visitez un site web. Il permet au site de mémoriser vos actions et préférences 
                (comme la langue, la taille des caractères et d'autres préférences d'affichage) pendant 
                une période donnée.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Comment utilisons-nous les cookies ?</h2>
              <p>
                Attractive Trip utilise des cookies pour plusieurs raisons :
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Améliorer votre expérience de navigation</li>
                <li>Mémoriser vos préférences (langue, région)</li>
                <li>Analyser le trafic et l'utilisation de notre site</li>
                <li>Personnaliser le contenu et les offres</li>
                <li>Assurer la sécurité de nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Types de cookies utilisés</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Cookies essentiels</h3>
                  <p>
                    Ces cookies sont nécessaires au fonctionnement du site. Ils permettent des fonctions 
                    de base comme la navigation entre les pages et l'accès aux zones sécurisées. Le site 
                    ne peut pas fonctionner correctement sans ces cookies.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Cookies de performance</h3>
                  <p>
                    Ces cookies collectent des informations sur la façon dont vous utilisez notre site, 
                    comme les pages que vous visitez le plus souvent. Ces informations nous permettent 
                    d'améliorer le fonctionnement de notre site.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Cookies de fonctionnalité</h3>
                  <p>
                    Ces cookies permettent au site de mémoriser vos choix (comme votre nom d'utilisateur, 
                    votre langue ou votre région) pour vous offrir des fonctions personnalisées et 
                    améliorées.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Cookies de ciblage</h3>
                  <p>
                    Ces cookies sont utilisés pour diffuser des publicités plus pertinentes pour vous 
                    et vos intérêts. Ils permettent également de limiter le nombre de fois que vous 
                    voyez une publicité et d'évaluer l'efficacité des campagnes publicitaires.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Durée de conservation</h2>
              <p>
                La durée de conservation des cookies varie selon leur type :
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
                <li><strong>Cookies persistants :</strong> conservés entre 1 mois et 2 ans maximum</li>
                <li><strong>Cookies analytiques :</strong> conservés 26 mois maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Gestion des cookies</h2>
              <p>
                Vous pouvez contrôler et gérer les cookies de plusieurs façons :
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Paramètres du navigateur</h3>
                  <p>
                    La plupart des navigateurs vous permettent de contrôler les cookies via leurs paramètres. 
                    Vous pouvez généralement trouver ces paramètres dans le menu "Options" ou "Préférences" 
                    de votre navigateur.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Outils de gestion</h3>
                  <p>
                    Nous proposons également des outils sur notre site pour vous permettre de gérer 
                    vos préférences de cookies. Vous pouvez accéder à ces paramètres via la bannière 
                    de cookies ou les liens dans le pied de page.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Cookies de tiers</h2>
              <p>
                Nous utilisons également des services tiers qui peuvent déposer des cookies :
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Google Analytics :</strong> pour l'analyse du trafic</li>
                <li><strong>Réseaux sociaux :</strong> pour le partage de contenu</li>
                <li><strong>Services de cartographie :</strong> pour l'affichage des cartes</li>
                <li><strong>Plateformes publicitaires :</strong> pour la diffusion de publicités</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez des droits suivants concernant vos données :
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact</h2>
              <p>
                Pour toute question concernant notre politique de cookies ou pour exercer vos droits, 
                vous pouvez nous contacter à :
              </p>
              <p>
                <strong>Email :</strong> privacy@attractive-trip.com<br/>
                <strong>Adresse :</strong> [Adresse postale de l'entreprise]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Mise à jour de cette politique</h2>
              <p>
                Cette politique de cookies peut être mise à jour périodiquement. Nous vous encourageons 
                à consulter régulièrement cette page pour rester informé de la façon dont nous utilisons 
                les cookies.
              </p>
              <p>
                <strong>Dernière mise à jour :</strong> 27 août 2025
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueCookies;