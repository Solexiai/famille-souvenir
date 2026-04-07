import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Users, Image, Lock } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const features = [
    {
      icon: Users,
      title: 'Cercle familial',
      description: 'Réunissez vos proches dans un espace privé et sécurisé.',
    },
    {
      icon: Image,
      title: 'Souvenirs partagés',
      description: 'Photos, vidéos, audio et textes pour préserver votre histoire.',
    },
    {
      icon: Lock,
      title: 'Coffre-fort numérique',
      description: 'Documents importants stockés avec le plus haut niveau de confidentialité.',
    },
    {
      icon: Shield,
      title: 'Vie privée respectée',
      description: 'Vos données vous appartiennent. Contrôle total de la visibilité.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold text-foreground">Solexi.ai</span>
            <span className="text-sm text-muted-foreground">Famille</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link to="/signup">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 text-center">
        <div className="mx-auto max-w-2xl animate-fade-in">
          <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            Préservez l'héritage de votre famille
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Un espace sécurisé et élégant pour rassembler vos souvenirs, protéger vos documents
            et transmettre ce qui compte vraiment.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="xl">Commencer gratuitement</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">J'ai déjà un compte</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 shadow-soft text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Solexi.ai — Tous droits réservés</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">Confidentialité</Link>
            <Link to="/terms" className="hover:text-foreground">Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
