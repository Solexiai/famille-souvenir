import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Home, Shield, FolderOpen, CheckSquare, Image, Briefcase, Settings, LogOut, Menu, Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AI_COPY, type AILang } from '@/lib/ai-assistant-i18n';

const navKeys = [
  { href: '/dashboard', labelKey: 'home', icon: Home },
  { href: '/assistant', labelKey: 'assistant', icon: Sparkles },
  { href: '/governance', labelKey: 'governance', icon: Shield },
  { href: '/documents', labelKey: 'documents', icon: FolderOpen },
  { href: '/checklist', labelKey: 'checklist', icon: CheckSquare },
  { href: '/memories', labelKey: 'memories', icon: Image },
  { href: '/executor', labelKey: 'executor', icon: Briefcase },
  { href: '/settings', labelKey: 'settings', icon: Settings },
] as const;

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const { t, terms } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close drawer automatically on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
        <div className="container flex h-16 md:h-16 items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group min-w-0">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.6)] group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="font-heading text-lg sm:text-xl font-semibold text-primary tracking-tight truncate">{t.app_name}</span>
            <span className="hidden md:inline text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.app_tagline}</span>
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

          <div className="flex items-center gap-1 lg:hidden">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t.nav_home}
              className="h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — premium sanctuary feel */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-[88vw] sm:max-w-sm p-0 bg-card border-l border-border/70 flex flex-col"
        >
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent" aria-hidden="true" />

          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 text-left space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.6)]" aria-hidden="true" />
              <SheetTitle className="font-heading text-xl text-primary tracking-tight">
                {t.app_name}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t.app_tagline}
            </SheetDescription>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              {navKeys.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={[
                        'group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors',
                        active
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground',
                      ].join(' ')}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent" aria-hidden="true" />
                      )}
                      <span
                        className={[
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                          active
                            ? 'bg-accent/15 text-accent'
                            : 'bg-muted/60 text-muted-foreground group-hover:text-foreground',
                        ].join(' ')}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="font-heading tracking-tight">{getLabel(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border/60 px-4 py-4 space-y-3 bg-card/60">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t.settings_language ?? 'Langue'}
              </span>
              <LanguageSwitcher variant="compact" />
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground rounded-xl h-11"
            >
              <LogOut className="h-4 w-4" />
              {t.sign_out}
            </Button>
            <p className="px-1 text-[11px] text-muted-foreground/80 tracking-wide">
              {t.landing_trust_security ?? ''} · {t.landing_trust_privacy ?? ''}
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <main className="container py-6 md:py-10">
        {children}
      </main>

      <footer className="border-t border-border/60 bg-card/40 mt-12">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground text-center sm:text-left">
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
