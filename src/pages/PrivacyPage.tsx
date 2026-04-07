import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPage: React.FC = () => (
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
      <h1 className="font-heading text-3xl font-semibold text-foreground mb-6">Politique de confidentialité</h1>
      <div className="prose prose-neutral max-w-none space-y-4 text-muted-foreground">
        <p>
          Chez Solexi.ai, nous prenons la protection de vos données personnelles très au sérieux.
          Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
        </p>
        <h2 className="font-heading text-xl font-medium text-foreground mt-8">Données collectées</h2>
        <p>
          Nous collectons uniquement les données nécessaires au fonctionnement de notre service :
          votre nom, adresse email, et les contenus que vous choisissez de partager (souvenirs, documents).
        </p>
        <h2 className="font-heading text-xl font-medium text-foreground mt-8">Utilisation des données</h2>
        <p>
          Vos données sont utilisées exclusivement pour fournir et améliorer notre service.
          Nous ne vendons jamais vos informations à des tiers.
        </p>
        <h2 className="font-heading text-xl font-medium text-foreground mt-8">Sécurité</h2>
        <p>
          Toutes les données sont chiffrées en transit et au repos.
          L'accès à vos documents privés est strictement contrôlé par des règles de sécurité.
        </p>
        <h2 className="font-heading text-xl font-medium text-foreground mt-8">Vos droits</h2>
        <p>
          Vous pouvez à tout moment exporter ou supprimer vos données depuis les paramètres de votre compte.
        </p>
      </div>
      <div className="mt-8">
        <Link to="/"><Button variant="outline">Retour à l'accueil</Button></Link>
      </div>
    </main>
  </div>
);

export default PrivacyPage;
