import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Loader2, ChefHat, Search, Star, Heart, Clock, Users as UsersIcon, GitBranch,
  CalendarDays, BookOpen, Sparkles, ChevronRight, Plus, ArrowLeft, FileText,
  Mic, Image as ImageIcon, Pencil, ScanLine, UserPlus,
} from 'lucide-react';
import type { FamilyCircle } from '@/types/database';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { RecipeQuickAddDialog, type ExtractedRecipe } from '@/components/recipes/RecipeQuickAddDialog';
import { prepareImageForUpload } from '@/lib/image-preparation';
import recipeTourtiere from '@/assets/demo/recipe-tourtiere.jpg';
import recipeApplePie from '@/assets/demo/recipe-apple-pie.jpg';
import recipeSpaghetti from '@/assets/demo/recipe-spaghetti.jpg';
import recipeCookies from '@/assets/demo/recipe-cookies.jpg';

// ======== Types ========

type DishType = 'appetizer' | 'soup' | 'main' | 'side' | 'dessert' | 'preserve' | 'drink' | 'sauce' | 'bread' | 'other';
type Difficulty = 'easy' | 'medium' | 'hard';
type Privacy = 'private' | 'managers' | 'circle';

interface Recipe {
  id: string;
  circle_id: string;
  created_by: string;
  title: string;
  description: string;
  story: string;
  ingredients: string[];
  steps: string[];
  preparation_time_minutes: number;
  cooking_time_minutes: number;
  servings: number;
  difficulty: Difficulty;
  dish_type: DishType;
  image_url: string | null;
  family_branch_id: string | null;
  generation_id: string | null;
  original_author_member_id: string | null;
  transmitted_by_member_id: string | null;
  scanned_document_id: string | null;
  privacy_level: Privacy;
  is_featured: boolean;
  has_handwritten_note: boolean;
  has_audio_memory: boolean;
  created_at: string;
  updated_at: string;
}

interface FamilyBranch { id: string; circle_id: string; name: string; description: string; color: string }
interface Generation { id: string; circle_id: string; name: string; rank: number; era: string }
interface Occasion { id: string; circle_id: string; name: string; icon: string }

// ======== Demo data (when DB is empty) ========

const DEMO_RECIPES = [
  {
    id: 'demo-tourtiere',
    title: 'Tourtière de Grand-maman Louise',
    branch: 'Branche Tremblay',
    occasion: 'Noël',
    transmittedBy: 'Grand-maman Louise',
    generations: 3,
    timeMinutes: 80,
    image: recipeTourtiere,
    badges: ['handwritten', 'memory'],
    featured: true,
  },
  {
    id: 'demo-apple-pie',
    title: 'Tarte aux pommes',
    branch: 'Branche Tremblay',
    occasion: 'Dimanche en famille',
    transmittedBy: 'Tante Hélène',
    generations: 2,
    timeMinutes: 60,
    image: recipeApplePie,
    badges: ['photo'],
  },
  {
    id: 'demo-spaghetti',
    title: 'Sauce à spaghetti',
    branch: 'Branche Tremblay',
    occasion: 'Recette de mariage 1968',
    transmittedBy: 'Grand-papa Gérard',
    generations: 2,
    timeMinutes: 180,
    image: recipeSpaghetti,
    badges: ['audio', 'memory'],
  },
  {
    id: 'demo-cookies',
    title: 'Biscuits de Grand-maman',
    branch: 'Branche Dupont',
    occasion: 'Goûter du dimanche',
    transmittedBy: 'Grand-maman Louise',
    generations: 2,
    timeMinutes: 40,
    image: recipeCookies,
    badges: ['handwritten'],
  },
] as const;

// ======== Helpers ========

const FILTER_CHIPS = [
  { key: 'all', label: 'Tous' },
  { key: 'branch', label: 'Branche familiale' },
  { key: 'dessert', label: 'Desserts' },
  { key: 'main', label: 'Plats mijotés' },
  { key: 'celebration', label: 'Fêtes' },
  { key: 'quick', label: 'Rapide' },
  { key: 'handwritten', label: 'Carnet manuscrit' },
  { key: 'favorites', label: 'Favoris' },
] as const;
type FilterKey = (typeof FILTER_CHIPS)[number]['key'];

const CLASSIFICATIONS = [
  { key: 'family', label: 'Par famille', Icon: UsersIcon, hint: 'Branches & lignées' },
  { key: 'occasion', label: 'Par occasion', Icon: CalendarDays, hint: 'Noël, mariages, fêtes' },
  { key: 'generation', label: 'Par génération', Icon: GitBranch, hint: 'Époques & lignées' },
  { key: 'dish', label: 'Par type de plat', Icon: ChefHat, hint: 'Entrées, mains, desserts' },
  { key: 'scanned', label: 'Carnets numérisés', Icon: BookOpen, hint: 'Recettes manuscrites' },
  { key: 'favorites', label: 'Favoris', Icon: Heart, hint: 'Vos préférées' },
] as const;
type ClassificationKey = (typeof CLASSIFICATIONS)[number]['key'];

const DISH_TYPE_LABEL: Record<DishType, string> = {
  appetizer: 'Entrée', soup: 'Soupe', main: 'Plat principal', side: 'Accompagnement',
  dessert: 'Dessert', preserve: 'Conserve', drink: 'Boisson', sauce: 'Sauce',
  bread: 'Pain', other: 'Autre',
};

function formatDuration(minutes: number): string {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m.toString().padStart(2, '0')}` : `${h} h`;
}

// ======== Main Page ========

const RecipesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [branches, setBranches] = useState<FamilyBranch[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [members, setMembers] = useState<Array<{ id: string; user_id: string; name: string }>>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recipeOccasions, setRecipeOccasions] = useState<Record<string, string[]>>({});

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const view: ClassificationKey | 'list' = (searchParams.get('view') as ClassificationKey) || 'list';

  const [createOpen, setCreateOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [recipePrefill, setRecipePrefill] = useState<RecipePrefill | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);

  const handleExtracted = useCallback((extracted: ExtractedRecipe) => {
    setRecipePrefill({
      title: extracted.title,
      story: extracted.notes || '',
      ingredients: extracted.ingredients,
      steps: extracted.steps,
      preparation_time_minutes: extracted.preparation_time_minutes,
      cooking_time_minutes: extracted.cooking_time_minutes,
      servings: extracted.servings,
      dish_type: extracted.dish_type,
      difficulty: extracted.difficulty,
      has_handwritten_note: !!extracted.is_handwritten,
      scannedImageBase64: extracted.scannedImageBase64,
    });
    setQuickAddOpen(false);
    setCreateOpen(true);
    toast.success('Recette détectée ! Vérifiez et enregistrez.');
  }, []);

  // ====== Data loading ======
  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) {
      setLoading(false);
      return;
    }
    const c = circles[0] as FamilyCircle;
    setCircle(c);

    const [r, b, g, o, f, ro, cm] = await Promise.all([
      supabase.from('recipes').select('*').eq('circle_id', c.id).order('created_at', { ascending: false }),
      supabase.from('family_branches').select('*').eq('circle_id', c.id),
      supabase.from('generations').select('*').eq('circle_id', c.id).order('rank'),
      supabase.from('occasions').select('*').eq('circle_id', c.id),
      supabase.from('recipe_favorites').select('recipe_id').eq('user_id', user.id),
      supabase.from('recipe_occasions').select('recipe_id, occasion_id'),
      supabase.from('circle_members').select('id, user_id').eq('circle_id', c.id),
    ]);

    setRecipes((r.data as Recipe[]) || []);
    setBranches((b.data as FamilyBranch[]) || []);
    setGenerations((g.data as Generation[]) || []);
    setOccasions((o.data as Occasion[]) || []);
    setFavorites(new Set(((f.data as Array<{ recipe_id: string }>) || []).map((x) => x.recipe_id)));

    const map: Record<string, string[]> = {};
    ((ro.data as Array<{ recipe_id: string; occasion_id: string }>) || []).forEach((row) => {
      (map[row.recipe_id] ||= []).push(row.occasion_id);
    });
    setRecipeOccasions(map);

    // Load member profiles separately
    const cmRows = (cm.data as Array<{ id: string; user_id: string }>) || [];
    if (cmRows.length) {
      const userIds = cmRows.map((m) => m.user_id);
      const { data: profilesData } = await supabase.from('profiles').select('user_id, full_name, first_name, last_name').in('user_id', userIds);
      const profMap = new Map((profilesData || []).map((p: any) => [p.user_id, p]));
      setMembers(cmRows.map((m) => {
        const p: any = profMap.get(m.user_id) || {};
        const name = p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Membre';
        return { id: m.id, user_id: m.user_id, name };
      }));
    } else {
      setMembers([]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Sync route /recipes/:id -> open detail
  useEffect(() => {
    if (params.id) {
      setActiveRecipeId(params.id);
      setDetailOpen(true);
    }
  }, [params.id]);

  // ====== Derived data ======
  const filteredRecipes = useMemo(() => {
    let out = recipes;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.story.toLowerCase().includes(q) ||
        (r.ingredients || []).some((i) => String(i).toLowerCase().includes(q))
      );
    }
    switch (filter) {
      case 'dessert': out = out.filter((r) => r.dish_type === 'dessert'); break;
      case 'main': out = out.filter((r) => r.dish_type === 'main'); break;
      case 'quick': out = out.filter((r) => (r.preparation_time_minutes + r.cooking_time_minutes) <= 30); break;
      case 'handwritten': out = out.filter((r) => r.has_handwritten_note || r.scanned_document_id); break;
      case 'favorites': out = out.filter((r) => favorites.has(r.id)); break;
      default: break;
    }
    return out;
  }, [recipes, search, filter, favorites]);

  const featured = useMemo(() => recipes.find((r) => r.is_featured) || null, [recipes]);
  const hasRealRecipes = recipes.length > 0;

  // ====== Actions ======
  const toggleFavorite = async (recipeId: string) => {
    if (!user) return;
    const next = new Set(favorites);
    if (next.has(recipeId)) {
      next.delete(recipeId);
      setFavorites(next);
      await supabase.from('recipe_favorites').delete().eq('user_id', user.id).eq('recipe_id', recipeId);
    } else {
      next.add(recipeId);
      setFavorites(next);
      await supabase.from('recipe_favorites').insert({ user_id: user.id, recipe_id: recipeId });
    }
  };

  const openDetail = (id: string) => {
    setActiveRecipeId(id);
    setDetailOpen(true);
    navigate(`/recipes/${id}`, { replace: false });
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setActiveRecipeId(null);
    if (params.id) navigate('/recipes', { replace: true });
  };

  const setView = (v: ClassificationKey | 'list') => {
    if (v === 'list') {
      const s = new URLSearchParams(searchParams);
      s.delete('view');
      setSearchParams(s, { replace: true });
    } else {
      setSearchParams({ view: v }, { replace: true });
    }
  };

  // ====== Loading & empty circle ======
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }
  if (!circle) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Vous devez d'abord créer un cercle familial.</p>
          <Button className="mt-4" onClick={() => navigate('/circle')}>Créer un cercle</Button>
        </div>
      </AppLayout>
    );
  }

  // ====== Filtered view (classifications) ======
  if (view !== 'list') {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setView('list')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Toutes les recettes
          </Button>
          <FilteredView
            view={view as ClassificationKey}
            recipes={recipes}
            branches={branches}
            generations={generations}
            occasions={occasions}
            recipeOccasions={recipeOccasions}
            favorites={favorites}
            onOpen={openDetail}
            onToggleFavorite={toggleFavorite}
          />
        </div>
        <RecipeDetailDialog
          open={detailOpen}
          onClose={closeDetail}
          recipeId={activeRecipeId}
          recipes={recipes}
          branches={branches}
          generations={generations}
          occasions={occasions}
          recipeOccasions={recipeOccasions}
          members={members}
          isFavorite={activeRecipeId ? favorites.has(activeRecipeId) : false}
          onToggleFavorite={toggleFavorite}
        />
      </AppLayout>
    );
  }

  // ====== Main list view ======
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(35_60%_92%)]">
            <ChefHat className="h-7 w-7 text-[hsl(35_70%_45%)]" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Recettes familiales
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Les saveurs, souvenirs et secrets transmis de génération en génération.
          </p>
        </header>

        {/* Search bar */}
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une recette, un ingrédient, une personne, un souvenir…"
            className="pl-12 h-12 rounded-full bg-card border-border shadow-sm text-base"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {FILTER_CHIPS.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                filter === c.key
                  ? 'bg-[hsl(35_60%_92%)] border-[hsl(35_60%_55%)] text-[hsl(35_70%_30%)]'
                  : 'bg-card border-border text-foreground hover:border-[hsl(35_60%_55%)]/40'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Featured recipe */}
        {(featured || !hasRealRecipes) && (
          <FeaturedCard
            recipe={featured}
            onOpen={() => featured && openDetail(featured.id)}
            onCreate={() => setCreateOpen(true)}
            isFavorite={featured ? favorites.has(featured.id) : false}
            onToggleFavorite={() => featured && toggleFavorite(featured.id)}
          />
        )}

        {/* Classification grid */}
        <section aria-label="Classification" className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CLASSIFICATIONS.map((c) => (
            <button
              key={c.key}
              onClick={() => setView(c.key)}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(35_60%_92%)] text-[hsl(35_70%_45%)]">
                <c.Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-base font-semibold text-foreground leading-snug">{c.label}</h3>
                <p className="text-xs text-muted-foreground">{c.hint}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </section>

        {/* Recipes grid */}
        <section aria-label="Nos recettes">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Nos recettes</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setQuickAddOpen(true)}
                className="gap-1.5 bg-[hsl(35_60%_55%)] hover:bg-[hsl(35_60%_48%)] text-white"
              >
                <Sparkles className="h-4 w-4" /> Scan IA
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setRecipePrefill(null); setCreateOpen(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Manuel
              </Button>
            </div>
          </div>

          {hasRealRecipes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredRecipes.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  branchName={branches.find((b) => b.id === r.family_branch_id)?.name}
                  generationName={generations.find((g) => g.id === r.generation_id)?.name}
                  occasionName={occasions.find((o) => o.id === (recipeOccasions[r.id] || [])[0])?.name}
                  isFavorite={favorites.has(r.id)}
                  onToggleFavorite={() => toggleFavorite(r.id)}
                  onOpen={() => openDetail(r.id)}
                />
              ))}
              {filteredRecipes.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  Aucune recette ne correspond à votre recherche.
                </p>
              )}
            </div>
          ) : (
            <DemoRecipesGrid onOpen={() => setCreateOpen(true)} />
          )}
        </section>

        {/* Empty state full block (only when no real recipes) */}
        {!hasRealRecipes && (
          <EmptyStateBlock
            onCreate={() => { setRecipePrefill(null); setCreateOpen(true); }}
            onScan={() => setQuickAddOpen(true)}
            onInvite={() => navigate('/circle/members')}
          />
        )}

        {/* Heritage callout */}
        <HeritageCallout onAddMemory={() => navigate('/memories')} />
      </div>

      <RecipeQuickAddDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onExtracted={handleExtracted}
      />

      <CreateRecipeDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setRecipePrefill(null); }}
        circle={circle}
        userId={user!.id}
        branches={branches}
        generations={generations}
        occasions={occasions}
        members={members}
        prefill={recipePrefill}
        onCreated={() => { setCreateOpen(false); setRecipePrefill(null); loadAll(); }}
      />

      <RecipeDetailDialog
        open={detailOpen}
        onClose={closeDetail}
        recipeId={activeRecipeId}
        recipes={recipes}
        branches={branches}
        generations={generations}
        occasions={occasions}
        recipeOccasions={recipeOccasions}
        members={members}
        isFavorite={activeRecipeId ? favorites.has(activeRecipeId) : false}
        onToggleFavorite={toggleFavorite}
      />
    </AppLayout>
  );
};

// ======== Sub-components ========

const FeaturedCard: React.FC<{
  recipe: Recipe | null;
  onOpen: () => void;
  onCreate: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}> = ({ recipe, onOpen, onCreate, isFavorite, onToggleFavorite }) => {
  const isDemo = !recipe;
  const demo = DEMO_RECIPES[0];
  const title = recipe?.title || demo.title;
  const transmittedBy = recipe ? '—' : demo.transmittedBy;
  const generations = recipe ? '—' : `${demo.generations}`;
  const time = recipe ? formatDuration(recipe.preparation_time_minutes + recipe.cooking_time_minutes) : formatDuration(demo.timeMinutes);
  const image = recipe?.image_url || demo.image;

  return (
    <Card className="overflow-hidden border-border bg-card shadow-md">
      <div className="grid md:grid-cols-2">
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[hsl(35_70%_45%)] uppercase">
              <Star className="h-3.5 w-3.5 fill-current" /> Recette à l'honneur
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground mt-3 leading-tight">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Transmise par <span className="text-[hsl(35_70%_35%)] font-medium">{transmittedBy}</span>
            </p>
            <div className="flex items-center gap-5 mt-5 text-sm text-foreground">
              <span className="inline-flex items-center gap-1.5"><UsersIcon className="h-4 w-4 text-muted-foreground" /> {generations} générations</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-muted-foreground" /> {time}</span>
              <button onClick={onToggleFavorite} aria-label="Favori">
                <Heart className={cn('h-5 w-5 transition-colors', isFavorite ? 'fill-[hsl(355_60%_55%)] text-[hsl(355_60%_55%)]' : 'text-muted-foreground')} />
              </button>
            </div>
          </div>
          <Button
            onClick={isDemo ? onCreate : onOpen}
            className="mt-6 w-fit bg-[hsl(35_60%_55%)] hover:bg-[hsl(35_60%_48%)] text-white rounded-full"
          >
            {isDemo ? 'Ajouter votre première recette' : 'Voir la recette'} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative h-64 md:h-auto bg-muted">
          <img src={typeof image === 'string' ? image : (image as string)} alt={title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      </div>
    </Card>
  );
};

const RecipeCard: React.FC<{
  recipe: Recipe;
  branchName?: string;
  generationName?: string;
  occasionName?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
}> = ({ recipe, branchName, generationName, occasionName, isFavorite, onToggleFavorite, onOpen }) => {
  const subtitle = branchName || occasionName || generationName || DISH_TYPE_LABEL[recipe.dish_type];
  return (
    <button onClick={onOpen} className="group text-left rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ChefHat className="h-12 w-12 opacity-30" />
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm"
          aria-label="Favori"
        >
          <Heart className={cn('h-4 w-4', isFavorite ? 'fill-[hsl(355_60%_55%)] text-[hsl(355_60%_55%)]' : 'text-foreground/60')} />
        </button>
        {(recipe.has_handwritten_note || recipe.has_audio_memory) && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {recipe.has_handwritten_note && <Badge className="bg-white/90 text-foreground gap-1 text-[10px]"><FileText className="h-3 w-3" /> Note</Badge>}
            {recipe.has_audio_memory && <Badge className="bg-white/90 text-foreground gap-1 text-[10px]"><Mic className="h-3 w-3" /> Audio</Badge>}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-heading text-base font-semibold text-foreground leading-snug line-clamp-1">{recipe.title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{subtitle}</p>
      </div>
    </button>
  );
};

const DemoRecipesGrid: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {DEMO_RECIPES.map((r) => (
      <button key={r.id} onClick={onOpen} className="group text-left rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <Badge className="absolute top-2 left-2 bg-white/90 text-[hsl(35_70%_35%)] text-[10px]">DÉMO</Badge>
          <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
            {r.badges.includes('handwritten' as never) && <Badge className="bg-white/90 text-foreground gap-1 text-[10px]"><FileText className="h-3 w-3" /> Manuscrit</Badge>}
            {r.badges.includes('audio' as never) && <Badge className="bg-white/90 text-foreground gap-1 text-[10px]"><Mic className="h-3 w-3" /> Audio</Badge>}
            {r.badges.includes('memory' as never) && <Badge className="bg-white/90 text-foreground gap-1 text-[10px]"><Heart className="h-3 w-3" /> Souvenir</Badge>}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-heading text-base font-semibold text-foreground leading-snug line-clamp-1">{r.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.branch} · {r.occasion}</p>
        </div>
      </button>
    ))}
  </div>
);

const EmptyStateBlock: React.FC<{ onCreate: () => void; onScan: () => void; onInvite: () => void }> = ({ onCreate, onScan, onInvite }) => (
  <Card className="border-dashed border-2 border-[hsl(35_60%_55%)]/40 bg-[hsl(35_60%_97%)]">
    <CardContent className="p-8 text-center space-y-4">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(35_60%_92%)]">
        <BookOpen className="h-7 w-7 text-[hsl(35_70%_45%)]" />
      </div>
      <h3 className="font-heading text-2xl font-bold text-foreground">Commencez votre livre de recettes familial</h3>
      <p className="text-muted-foreground max-w-xl mx-auto">
        Ajoutez une première recette, numérisez un carnet manuscrit ou invitez un proche à partager un souvenir culinaire.
      </p>
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        <Button onClick={onCreate} className="bg-[hsl(35_60%_55%)] hover:bg-[hsl(35_60%_48%)] text-white gap-2"><Plus className="h-4 w-4" /> Ajouter une recette</Button>
        <Button onClick={onScan} variant="outline" className="gap-2"><ScanLine className="h-4 w-4" /> Numériser une recette</Button>
        <Button onClick={onInvite} variant="outline" className="gap-2"><UserPlus className="h-4 w-4" /> Inviter un proche</Button>
      </div>
    </CardContent>
  </Card>
);

const HeritageCallout: React.FC<{ onAddMemory: () => void }> = ({ onAddMemory }) => (
  <Card className="overflow-hidden border-border bg-gradient-to-br from-[hsl(35_60%_97%)] to-[hsl(40_33%_98%)] shadow-sm">
    <CardContent className="p-6 sm:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
      <div className="space-y-3">
        <h3 className="font-heading text-2xl font-bold text-foreground">L'histoire derrière la recette</h3>
        <p className="text-muted-foreground leading-relaxed">
          Chaque recette a une histoire. Préservons-la ensemble pour les générations à venir.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-sm">
          <span className="inline-flex items-center gap-1.5 text-foreground"><ImageIcon className="h-4 w-4 text-[hsl(35_70%_45%)]" /> Photos de famille</span>
          <span className="inline-flex items-center gap-1.5 text-foreground"><Mic className="h-4 w-4 text-[hsl(35_70%_45%)]" /> Souvenirs audio</span>
          <span className="inline-flex items-center gap-1.5 text-foreground"><Pencil className="h-4 w-4 text-[hsl(35_70%_45%)]" /> Notes manuscrites</span>
          <span className="inline-flex items-center gap-1.5 text-foreground"><Sparkles className="h-4 w-4 text-[hsl(35_70%_45%)]" /> Anecdotes</span>
        </div>
      </div>
      <Button onClick={onAddMemory} className="bg-[hsl(35_60%_55%)] hover:bg-[hsl(35_60%_48%)] text-white rounded-full">
        Ajouter un souvenir <ChevronRight className="h-4 w-4" />
      </Button>
    </CardContent>
  </Card>
);

// ====== Filtered view ======
const FilteredView: React.FC<{
  view: ClassificationKey;
  recipes: Recipe[];
  branches: FamilyBranch[];
  generations: Generation[];
  occasions: Occasion[];
  recipeOccasions: Record<string, string[]>;
  favorites: Set<string>;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}> = ({ view, recipes, branches, generations, occasions, recipeOccasions, favorites, onOpen, onToggleFavorite }) => {
  const labels: Record<ClassificationKey, string> = {
    family: 'Par famille', occasion: 'Par occasion', generation: 'Par génération',
    dish: 'Par type de plat', scanned: 'Carnets numérisés', favorites: 'Favoris',
  };

  const renderGroup = (title: string, items: Recipe[]) => (
    <div key={title} className="space-y-3">
      <h3 className="font-heading text-xl font-semibold text-foreground">{title} <span className="text-sm text-muted-foreground font-normal">({items.length})</span></h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune recette dans cette catégorie.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              branchName={branches.find((b) => b.id === r.family_branch_id)?.name}
              generationName={generations.find((g) => g.id === r.generation_id)?.name}
              occasionName={occasions.find((o) => o.id === (recipeOccasions[r.id] || [])[0])?.name}
              isFavorite={favorites.has(r.id)}
              onToggleFavorite={() => onToggleFavorite(r.id)}
              onOpen={() => onOpen(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  let groups: Array<{ title: string; items: Recipe[] }> = [];

  if (view === 'family') {
    groups = branches.map((b) => ({ title: b.name, items: recipes.filter((r) => r.family_branch_id === b.id) }));
    const orphans = recipes.filter((r) => !r.family_branch_id);
    if (orphans.length) groups.push({ title: 'Sans branche', items: orphans });
  } else if (view === 'generation') {
    groups = generations.map((g) => ({ title: g.name, items: recipes.filter((r) => r.generation_id === g.id) }));
    const orphans = recipes.filter((r) => !r.generation_id);
    if (orphans.length) groups.push({ title: 'Sans génération', items: orphans });
  } else if (view === 'occasion') {
    groups = occasions.map((o) => ({
      title: o.name,
      items: recipes.filter((r) => (recipeOccasions[r.id] || []).includes(o.id)),
    }));
    const orphans = recipes.filter((r) => !(recipeOccasions[r.id] || []).length);
    if (orphans.length) groups.push({ title: 'Sans occasion', items: orphans });
  } else if (view === 'dish') {
    const types: DishType[] = ['appetizer', 'soup', 'main', 'side', 'dessert', 'preserve', 'drink', 'sauce', 'bread', 'other'];
    groups = types.map((t) => ({ title: DISH_TYPE_LABEL[t], items: recipes.filter((r) => r.dish_type === t) })).filter((g) => g.items.length > 0);
  } else if (view === 'scanned') {
    groups = [{ title: 'Recettes manuscrites numérisées', items: recipes.filter((r) => r.has_handwritten_note || r.scanned_document_id) }];
  } else if (view === 'favorites') {
    groups = [{ title: 'Vos recettes favorites', items: recipes.filter((r) => favorites.has(r.id)) }];
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold text-foreground">{labels[view]}</h2>
      </div>
      {groups.length === 0 ? (
        <p className="text-muted-foreground">Aucune donnée à afficher. Commencez par ajouter une recette ou créer des branches familiales.</p>
      ) : (
        groups.map((g) => renderGroup(g.title, g.items))
      )}
    </section>
  );
};

// ====== Detail dialog ======
const RecipeDetailDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  recipeId: string | null;
  recipes: Recipe[];
  branches: FamilyBranch[];
  generations: Generation[];
  occasions: Occasion[];
  recipeOccasions: Record<string, string[]>;
  members: Array<{ id: string; user_id: string; name: string }>;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}> = ({ open, onClose, recipeId, recipes, branches, generations, occasions, recipeOccasions, members, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();
  const recipe = recipeId ? recipes.find((r) => r.id === recipeId) : null;
  if (!recipe) return null;
  const branch = branches.find((b) => b.id === recipe.family_branch_id);
  const gen = generations.find((g) => g.id === recipe.generation_id);
  const occ = (recipeOccasions[recipe.id] || []).map((id) => occasions.find((o) => o.id === id)?.name).filter(Boolean) as string[];
  const transmittedBy = members.find((m) => m.id === recipe.transmitted_by_member_id)?.name;
  const author = members.find((m) => m.id === recipe.original_author_member_id)?.name;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <DialogTitle className="font-heading text-3xl">{recipe.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {[branch?.name, occ[0], gen?.name].filter(Boolean).join(' · ') || DISH_TYPE_LABEL[recipe.dish_type]}
              </DialogDescription>
            </div>
            <button onClick={() => onToggleFavorite(recipe.id)} aria-label="Favori">
              <Heart className={cn('h-6 w-6', isFavorite ? 'fill-[hsl(355_60%_55%)] text-[hsl(355_60%_55%)]' : 'text-muted-foreground')} />
            </button>
          </div>
        </DialogHeader>

        {recipe.image_url && (
          <div className="rounded-lg overflow-hidden bg-muted aspect-[16/9]">
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Préparation</div><div className="font-medium">{formatDuration(recipe.preparation_time_minutes)}</div></div>
          <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Cuisson</div><div className="font-medium">{formatDuration(recipe.cooking_time_minutes)}</div></div>
          <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Portions</div><div className="font-medium">{recipe.servings || '—'}</div></div>
        </div>

        {recipe.story && (
          <section>
            <h3 className="font-heading text-lg font-semibold mb-2">L'histoire de cette recette</h3>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{recipe.story}</p>
          </section>
        )}

        {recipe.ingredients?.length > 0 && (
          <section>
            <h3 className="font-heading text-lg font-semibold mb-2">Ingrédients</h3>
            <ul className="list-disc list-inside space-y-1 text-foreground/90">
              {recipe.ingredients.map((i, idx) => <li key={idx}>{String(i)}</li>)}
            </ul>
          </section>
        )}

        {recipe.steps?.length > 0 && (
          <section>
            <h3 className="font-heading text-lg font-semibold mb-2">Étapes</h3>
            <ol className="list-decimal list-inside space-y-2 text-foreground/90">
              {recipe.steps.map((s, idx) => <li key={idx} className="leading-relaxed">{String(s)}</li>)}
            </ol>
          </section>
        )}

        <section className="rounded-lg border border-border p-4 space-y-2 text-sm">
          {transmittedBy && <div><span className="text-muted-foreground">Transmise par : </span><span className="font-medium">{transmittedBy}</span></div>}
          {author && <div><span className="text-muted-foreground">Auteur original : </span><span className="font-medium">{author}</span></div>}
          {branch && <div><span className="text-muted-foreground">Branche familiale : </span><span className="font-medium">{branch.name}</span></div>}
          {gen && <div><span className="text-muted-foreground">Génération : </span><span className="font-medium">{gen.name}</span></div>}
          {occ.length > 0 && <div><span className="text-muted-foreground">Occasions : </span><span className="font-medium">{occ.join(', ')}</span></div>}
        </section>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => navigate('/memories')} className="gap-2"><Plus className="h-4 w-4" /> Ajouter un souvenir</Button>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ====== Create dialog ======
export interface RecipePrefill {
  title?: string;
  story?: string;
  ingredients?: string[];
  steps?: string[];
  preparation_time_minutes?: number;
  cooking_time_minutes?: number;
  servings?: number;
  dish_type?: DishType;
  difficulty?: Difficulty;
  has_handwritten_note?: boolean;
  scannedImageBase64?: string;
}

const CreateRecipeDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  circle: FamilyCircle;
  userId: string;
  branches: FamilyBranch[];
  generations: Generation[];
  occasions: Occasion[];
  members: Array<{ id: string; user_id: string; name: string }>;
  onCreated: () => void;
  prefill?: RecipePrefill | null;
}> = ({ open, onClose, circle, userId, branches, generations, occasions, members, onCreated, prefill }) => {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [dishType, setDishType] = useState<DishType>('main');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [branchId, setBranchId] = useState<string>('');
  const [generationId, setGenerationId] = useState<string>('');
  const [transmittedBy, setTransmittedBy] = useState<string>('');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [hasHandwritten, setHasHandwritten] = useState(false);
  const [privacy, setPrivacy] = useState<Privacy>('circle');

  // Apply prefill when dialog opens with new prefill data
  useEffect(() => {
    if (open && prefill) {
      if (prefill.title !== undefined) setTitle(prefill.title);
      if (prefill.story !== undefined) setStory(prefill.story);
      if (prefill.ingredients !== undefined) setIngredientsText(prefill.ingredients.join('\n'));
      if (prefill.steps !== undefined) setStepsText(prefill.steps.join('\n'));
      if (prefill.preparation_time_minutes !== undefined) setPrepTime(String(prefill.preparation_time_minutes || ''));
      if (prefill.cooking_time_minutes !== undefined) setCookTime(String(prefill.cooking_time_minutes || ''));
      if (prefill.servings !== undefined) setServings(String(prefill.servings || ''));
      if (prefill.dish_type) setDishType(prefill.dish_type);
      if (prefill.difficulty) setDifficulty(prefill.difficulty);
      if (prefill.has_handwritten_note !== undefined) setHasHandwritten(prefill.has_handwritten_note);
    }
  }, [open, prefill]);

  const reset = () => {
    setTitle(''); setStory(''); setIngredientsText(''); setStepsText('');
    setPrepTime(''); setCookTime(''); setServings('');
    setDishType('main'); setDifficulty('easy');
    setBranchId(''); setGenerationId(''); setTransmittedBy('');
    setSelectedOccasions([]); setSelectedMembers([]);
    setHasHandwritten(false); setPrivacy('circle');
  };

  const schema = z.object({
    title: z.string().trim().min(1, 'Le titre est requis').max(200),
    story: z.string().max(5000).optional(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ title, story });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);

    const ingredients = ingredientsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const steps = stepsText.split('\n').map((s) => s.trim()).filter(Boolean);

    // If we have a scanned image to attach, upload it first to memories-media
    let imageUrl: string | null = null;
    if (prefill?.scannedImageBase64) {
      try {
        const base64Data = prefill.scannedImageBase64.split(',')[1];
        const mimeMatch = prefill.scannedImageBase64.match(/^data:(.*?);base64/);
        const mime = mimeMatch?.[1] || 'image/jpeg';
        const ext = mime.split('/')[1] || 'jpg';
        const byteChars = atob(base64Data);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
        const path = `${userId}/recipes/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('memories-media').upload(path, blob, { contentType: mime });
        if (!upErr) {
          const { data: signed } = await supabase.storage.from('memories-media').createSignedUrl(path, 60 * 60 * 24 * 365);
          imageUrl = signed?.signedUrl || null;
        }
      } catch (err) {
        console.warn('Image upload failed', err);
      }
    }

    const { data, error } = await supabase.from('recipes').insert({
      circle_id: circle.id,
      created_by: userId,
      title: title.trim(),
      story: story.trim(),
      ingredients,
      steps,
      preparation_time_minutes: parseInt(prepTime || '0', 10) || 0,
      cooking_time_minutes: parseInt(cookTime || '0', 10) || 0,
      servings: parseInt(servings || '0', 10) || 0,
      difficulty,
      dish_type: dishType,
      family_branch_id: branchId || null,
      generation_id: generationId || null,
      transmitted_by_member_id: transmittedBy || null,
      privacy_level: privacy,
      has_handwritten_note: hasHandwritten,
      image_url: imageUrl,
    }).select().single();

    if (error || !data) {
      toast.error("Impossible d'enregistrer la recette");
      setSaving(false);
      return;
    }

    // Insert links
    if (selectedOccasions.length) {
      await supabase.from('recipe_occasions').insert(selectedOccasions.map((occasion_id) => ({ recipe_id: data.id, occasion_id })));
    }
    if (selectedMembers.length) {
      await supabase.from('recipe_members').insert(selectedMembers.map((member_id) => ({ recipe_id: data.id, member_id })));
    }

    toast.success('Recette ajoutée à votre livre familial');
    reset();
    setSaving(false);
    onCreated();
  };

  const toggleInArray = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Ajouter une recette familiale</DialogTitle>
          <DialogDescription>Préservez une saveur, une histoire, un héritage.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Tourtière de Grand-maman Louise" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type de plat</Label>
              <Select value={dishType} onValueChange={(v) => setDishType(v as DishType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(DISH_TYPE_LABEL) as DishType[]).map((k) => (
                    <SelectItem key={k} value={k}>{DISH_TYPE_LABEL[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulté</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Intermédiaire</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div><Label htmlFor="prep">Prép. (min)</Label><Input id="prep" type="number" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} /></div>
            <div><Label htmlFor="cook">Cuisson (min)</Label><Input id="cook" type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} /></div>
            <div><Label htmlFor="serv">Portions</Label><Input id="serv" type="number" min="0" value={servings} onChange={(e) => setServings(e.target.value)} /></div>
          </div>

          <div>
            <Label htmlFor="story">L'histoire de cette recette</Label>
            <Textarea id="story" value={story} onChange={(e) => setStory(e.target.value)} rows={3} placeholder="D'où vient-elle ? Pour quelle occasion ? Quel souvenir y est attaché ?" />
          </div>

          <div>
            <Label htmlFor="ing">Ingrédients (un par ligne)</Label>
            <Textarea id="ing" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} rows={4} placeholder="500 g de viande hachée&#10;1 oignon&#10;..." />
          </div>

          <div>
            <Label htmlFor="steps">Étapes (une par ligne)</Label>
            <Textarea id="steps" value={stepsText} onChange={(e) => setStepsText(e.target.value)} rows={4} placeholder="Faire revenir les oignons...&#10;Ajouter la viande..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Branche familiale</Label>
              <Select value={branchId || 'none'} onValueChange={(v) => setBranchId(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Génération</Label>
              <Select value={generationId || 'none'} onValueChange={(v) => setGenerationId(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {generations.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Transmise par</Label>
            <Select value={transmittedBy || 'none'} onValueChange={(v) => setTransmittedBy(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Aucun membre" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {occasions.length > 0 && (
            <div>
              <Label className="mb-2 block">Occasions</Label>
              <div className="flex flex-wrap gap-1.5">
                {occasions.map((o) => (
                  <button key={o.id} type="button" onClick={() => toggleInArray(selectedOccasions, setSelectedOccasions, o.id)}
                    className={cn('px-3 py-1 rounded-full text-xs border transition', selectedOccasions.includes(o.id) ? 'bg-[hsl(35_60%_92%)] border-[hsl(35_60%_55%)] text-[hsl(35_70%_30%)]' : 'bg-card border-border')}>
                    {o.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {members.length > 0 && (
            <div>
              <Label className="mb-2 block">Membres associés</Label>
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => (
                  <button key={m.id} type="button" onClick={() => toggleInArray(selectedMembers, setSelectedMembers, m.id)}
                    className={cn('px-3 py-1 rounded-full text-xs border transition', selectedMembers.includes(m.id) ? 'bg-[hsl(220_45%_92%)] border-[hsl(220_45%_40%)] text-[hsl(220_45%_25%)]' : 'bg-card border-border')}>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hasHandwritten} onChange={(e) => setHasHandwritten(e.target.checked)} className="rounded" />
              Carnet manuscrit lié
            </label>
            <div className="ml-auto flex items-center gap-2">
              <Label className="text-sm">Visibilité :</Label>
              <Select value={privacy} onValueChange={(v) => setPrivacy(v as Privacy)}>
                <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="circle">Tout le cercle</SelectItem>
                  <SelectItem value="managers">Gestionnaires</SelectItem>
                  <SelectItem value="private">Privée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={saving} className="bg-[hsl(35_60%_55%)] hover:bg-[hsl(35_60%_48%)] text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Ajouter la recette
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecipesPage;
