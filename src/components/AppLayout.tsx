import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
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

const navKeys = [
  { href: '/dashboard', labelKey: 'home', icon: Home },
  { href: '/governance', labelKey: 'governance', icon: Shield },
  { href: '/documents', labelKey: 'documents', icon: FolderOpen },
  { href: '/checklist', labelKey: 'checklist', icon: CheckSquare },
  { href: '/memories', labelKey: 'memories', icon: Image },
  { href: '/executor', labelKey: 'executor', icon: Briefcase },
  { href: '/settings', labelKey: 'settings', icon: Settings },
] as const;

const navLabels: Record<string, Record<string, string>> = {
  fr: { home: 'Accueil', governance: 'Gouvernance', documents: 'Documents', checklist: 'Checklist', memories: 'Souvenirs', executor: 'Exécuteur', settings: 'Paramètres' },
  en: { home: 'Home', governance: 'Governance', documents: 'Documents', checklist: 'Checklist', memories: 'Memories', executor: 'Executor', settings: 'Settings' },
  es: { home: 'Inicio', governance: 'Gobernanza', documents: 'Documentos', checklist: 'Lista', memories: 'Recuerdos', executor: 'Albacea', settings: 'Ajustes' },
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const { t, lang, terms } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const labels = navLabels[lang] ?? navLabels.fr;
  // Override executor label with terminology-aware term
  const getLabel = (key: string) => {
    if (key === 'executor') return terms.executor.charAt(0).toUpperCase() + terms.executor.slice(1);
    return labels[key] ?? key;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold text-foreground">{t.app_name}</span>
            <span className="text-sm text-muted-foreground">{t.app_tagline}</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {navKeys.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.href);
                return (
                  <Link key={item.href} to={item.href}>
                    <Button variant={active ? 'secondary' : 'ghost'} size="sm" className="gap-1.5 text-xs">
                      <Icon className="h-4 w-4" />
                      {getLabel(item.labelKey)}
                    </Button>
                  </Link>
                );
              })}
            </nav>
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background p-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navKeys.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.href);
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={active ? 'secondary' : 'ghost'} className="w-full justify-start gap-3">
                      <Icon className="h-5 w-5" />
                      {getLabel(item.labelKey)}
                    </Button>
                  </Link>
                );
              })}
              <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3 text-muted-foreground">
                <LogOut className="h-5 w-5" />
                {t.sign_out}
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
