import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PricingPage: React.FC = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-semibold text-foreground">Solexi.ai</span>
          <span className="text-sm text-muted-foreground">Famille</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost">Se connecter</Button></Link>
          <Link to="/signup"><Button>Créer un compte</Button></Link>
        </div>
      </div>
    </header>
    <main className="container max-w-3xl py-20 text-center">
      <h1 className="font-heading text-3xl font-semibold text-foreground mb-4">Tarification</h1>
      <p className="text-muted-foreground mb-12 text-lg">
        Solexi.ai Famille est actuellement en accès anticipé. Profitez de toutes les fonctionnalités gratuitement.
      </p>
      <div className="rounded-xl border border-border bg-card p-8 shadow-card text-center mx-auto max-w-sm">
        <h2 className="font-heading text-2xl font-semibold text-foreground">Accès anticipé</h2>
        <p className="mt-2 text-4xl font-bold text-accent">Gratuit</p>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground text-left">
          <li>✓ 1 cercle familial</li>
          <li>✓ Souvenirs illimités</li>
          <li>✓ Coffre-fort sécurisé</li>
          <li>✓ Invitations de membres</li>
          <li>✓ Gestion des rôles</li>
        </ul>
        <Link to="/signup">
          <Button className="w-full mt-8" size="lg">Commencer</Button>
        </Link>
      </div>
    </main>
  </div>
);

export default PricingPage;
