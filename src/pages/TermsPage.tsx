import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-semibold text-foreground">Solexi.ai</span>
          <span className="text-sm text-muted-foreground">Famille</span>
        </Link>
      </div>
    </header>
    <main className="container max-w-3xl py-12">
      <h1 className="font-heading text-3xl font-semibold text-foreground mb-6">Conditions d'utilisation</h1>
      <div className="prose prose-neutral max-w-none space-y-4 text-muted-foreground">
        <p>
          En utilisant Solexi.ai Famille, vous acceptez les présentes conditions d'utilisation.
        </p>
        <h2 className="font-heading text-xl font-medium text-foreground mt-8">Service</h2>
        <p>
          Solexi.ai Famille est un service de préservation de souvenirs familiaux et de gestion de documents privés.
          Le service est fourni tel quel, sans garantie de disponibilité permanente.
        </p>
        <h2 className="font-heading text-xl font-medium text-foreground mt-8">Responsabilité</h2>
        <p>
          Vous êtes responsable du contenu que vous partagez au sein de votre cercle familial.
          Nous nous réservons le droit de suspendre tout compte en cas d'utilisation abusive.
        </p>
        <h2 className="font-heading text-xl font-medium text-foreground mt-8">Propriété intellectuelle</h2>
        <p>
          Vous conservez tous les droits sur les contenus que vous téléchargez.
          Solexi.ai ne revendique aucun droit de propriété sur vos souvenirs et documents.
        </p>
      </div>
      <div className="mt-8">
        <Link to="/"><Button variant="outline">Retour à l'accueil</Button></Link>
      </div>
    </main>
  </div>
);

export default TermsPage;
