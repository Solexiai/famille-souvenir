import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Home,
  Shield,
  FolderOpen,
  CheckSquare,
  Image,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/governance', label: 'Gouvernance', icon: Shield },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/checklist', label: 'Checklist', icon: CheckSquare },
  { href: '/memories', label: 'Souvenirs', icon: Image },
  { href: '/executor', label: 'Exécuteur', icon: Briefcase },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold text-foreground">Solexi.ai</span>
            <span className="text-sm text-muted-foreground">Famille</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.href);
              return (
                <Link key={item.href} to={item.href}>
                  <Button variant={active ? 'secondary' : 'ghost'} size="sm" className="gap-1.5 text-xs">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background p-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.href);
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={active ? 'secondary' : 'ghost'} className="w-full justify-start gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3 text-muted-foreground">
                <LogOut className="h-5 w-5" />
                Déconnexion
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="container py-8">
        {children}
      </main>
    </div>
  );
};
