import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Home, Shield, FolderOpen, CheckSquare, Image, Briefcase, Settings, LogOut, Menu, X,
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

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const { t, lang, terms } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getLabel = (key: string): string => {
    switch (key) {
      case 'home': return t.nav_home;
      case 'governance': return t.dash_governance;
      case 'documents': return t.dash_documents;
      case 'checklist': return t.dash_checklist;
      case 'memories': return t.dash_memories;
      case 'executor': return terms.executor.charAt(0).toUpperCase() + terms.executor.slice(1);
      case 'settings': return t.settings_title;
      default: return key;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 shadow-soft">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" aria-hidden="true" />
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.6)] group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="font-heading text-xl font-semibold text-primary tracking-tight">{t.app_name}</span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.app_tagline}</span>
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
            <LanguageSwitcher variant="compact" />
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <NotificationBell />
            <LanguageSwitcher variant="compact" />
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

      <main className="container py-8 md:py-10">
        {children}
      </main>

      <footer className="border-t border-border/60 bg-card/40 mt-12">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            <span className="font-heading text-sm text-primary/80">{t.app_name}</span>
            <span>·</span>
            <span>{t.app_tagline}</span>
          </p>
          <p className="tracking-wide">{t.landing_trust_security ?? ''} · {t.landing_trust_privacy ?? ''}</p>
        </div>
      </footer>
    </div>
  );
};
