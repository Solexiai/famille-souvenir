-- Enums
CREATE TYPE public.recipe_privacy AS ENUM ('private', 'managers', 'circle');
CREATE TYPE public.recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.recipe_dish_type AS ENUM ('appetizer', 'soup', 'main', 'side', 'dessert', 'preserve', 'drink', 'sauce', 'bread', 'other');

-- Branches familiales
CREATE TABLE public.family_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#8b6f47',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Générations
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL,
  name TEXT NOT NULL,
  rank INTEGER NOT NULL DEFAULT 1,
  era TEXT DEFAULT '',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Occasions
CREATE TABLE public.occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'sparkles',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recettes
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  story TEXT DEFAULT '',
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  preparation_time_minutes INTEGER DEFAULT 0,
  cooking_time_minutes INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 0,
  difficulty recipe_difficulty NOT NULL DEFAULT 'easy',
  dish_type recipe_dish_type NOT NULL DEFAULT 'main',
  image_url TEXT,
  family_branch_id UUID REFERENCES public.family_branches(id) ON DELETE SET NULL,
  generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  original_author_member_id UUID,
  transmitted_by_member_id UUID,
  scanned_document_id UUID,
  privacy_level recipe_privacy NOT NULL DEFAULT 'circle',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  has_handwritten_note BOOLEAN NOT NULL DEFAULT false,
  has_audio_memory BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Liens N-N
CREATE TABLE public.recipe_occasions (
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  occasion_id UUID NOT NULL REFERENCES public.occasions(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, occasion_id)
);

CREATE TABLE public.recipe_members (
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  member_id UUID NOT NULL,
  relation TEXT DEFAULT 'linked',
  PRIMARY KEY (recipe_id, member_id)
);

CREATE TABLE public.recipe_memories (
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  memory_id UUID NOT NULL,
  PRIMARY KEY (recipe_id, memory_id)
);

CREATE TABLE public.recipe_favorites (
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Indexes
CREATE INDEX idx_recipes_circle ON public.recipes(circle_id);
CREATE INDEX idx_recipes_branch ON public.recipes(family_branch_id);
CREATE INDEX idx_recipes_generation ON public.recipes(generation_id);
CREATE INDEX idx_recipes_dish_type ON public.recipes(dish_type);
CREATE INDEX idx_recipes_featured ON public.recipes(circle_id, is_featured);
CREATE INDEX idx_branches_circle ON public.family_branches(circle_id);
CREATE INDEX idx_generations_circle ON public.generations(circle_id);
CREATE INDEX idx_occasions_circle ON public.occasions(circle_id);

-- Triggers updated_at
CREATE TRIGGER trg_recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_branches_updated_at BEFORE UPDATE ON public.family_branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.family_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_favorites ENABLE ROW LEVEL SECURITY;

-- family_branches policies
CREATE POLICY "Members view branches" ON public.family_branches FOR SELECT
  USING (public.is_circle_member(auth.uid(), circle_id));
CREATE POLICY "Managers insert branches" ON public.family_branches FOR INSERT
  WITH CHECK (public.is_circle_manager(auth.uid(), circle_id) AND created_by = auth.uid());
CREATE POLICY "Managers update branches" ON public.family_branches FOR UPDATE
  USING (public.is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers delete branches" ON public.family_branches FOR DELETE
  USING (public.is_circle_manager(auth.uid(), circle_id));

-- generations policies
CREATE POLICY "Members view generations" ON public.generations FOR SELECT
  USING (public.is_circle_member(auth.uid(), circle_id));
CREATE POLICY "Managers insert generations" ON public.generations FOR INSERT
  WITH CHECK (public.is_circle_manager(auth.uid(), circle_id) AND created_by = auth.uid());
CREATE POLICY "Managers update generations" ON public.generations FOR UPDATE
  USING (public.is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers delete generations" ON public.generations FOR DELETE
  USING (public.is_circle_manager(auth.uid(), circle_id));

-- occasions policies
CREATE POLICY "Members view occasions" ON public.occasions FOR SELECT
  USING (public.is_circle_member(auth.uid(), circle_id));
CREATE POLICY "Managers insert occasions" ON public.occasions FOR INSERT
  WITH CHECK (public.is_circle_manager(auth.uid(), circle_id) AND created_by = auth.uid());
CREATE POLICY "Managers update occasions" ON public.occasions FOR UPDATE
  USING (public.is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers delete occasions" ON public.occasions FOR DELETE
  USING (public.is_circle_manager(auth.uid(), circle_id));

-- recipes policies
CREATE POLICY "Recipe access by privacy" ON public.recipes FOR SELECT
  USING (
    (privacy_level = 'circle' AND public.is_circle_member(auth.uid(), circle_id))
    OR (privacy_level = 'managers' AND public.is_circle_manager(auth.uid(), circle_id))
    OR (privacy_level = 'private' AND created_by = auth.uid())
  );
CREATE POLICY "Members insert recipes" ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = created_by AND public.is_circle_member(auth.uid(), circle_id));
CREATE POLICY "Authors update own recipes" ON public.recipes FOR UPDATE
  USING (created_by = auth.uid() OR public.is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Authors or owners delete recipes" ON public.recipes FOR DELETE
  USING (created_by = auth.uid() OR public.has_circle_role(auth.uid(), circle_id, 'owner'::app_role));

-- Helper function: can user access a recipe?
CREATE OR REPLACE FUNCTION public.can_access_recipe(_user_id UUID, _recipe_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recipes r
    WHERE r.id = _recipe_id
    AND (
      (r.privacy_level = 'circle' AND public.is_circle_member(_user_id, r.circle_id))
      OR (r.privacy_level = 'managers' AND public.is_circle_manager(_user_id, r.circle_id))
      OR (r.privacy_level = 'private' AND r.created_by = _user_id)
    )
  )
$$;

-- recipe_occasions policies
CREATE POLICY "View recipe occasions" ON public.recipe_occasions FOR SELECT
  USING (public.can_access_recipe(auth.uid(), recipe_id));
CREATE POLICY "Manage recipe occasions" ON public.recipe_occasions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (r.created_by = auth.uid() OR public.is_circle_manager(auth.uid(), r.circle_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (r.created_by = auth.uid() OR public.is_circle_manager(auth.uid(), r.circle_id))));

-- recipe_members policies
CREATE POLICY "View recipe members" ON public.recipe_members FOR SELECT
  USING (public.can_access_recipe(auth.uid(), recipe_id));
CREATE POLICY "Manage recipe members" ON public.recipe_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (r.created_by = auth.uid() OR public.is_circle_manager(auth.uid(), r.circle_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (r.created_by = auth.uid() OR public.is_circle_manager(auth.uid(), r.circle_id))));

-- recipe_memories policies
CREATE POLICY "View recipe memories" ON public.recipe_memories FOR SELECT
  USING (public.can_access_recipe(auth.uid(), recipe_id));
CREATE POLICY "Manage recipe memories" ON public.recipe_memories FOR ALL
  USING (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (r.created_by = auth.uid() OR public.is_circle_manager(auth.uid(), r.circle_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND (r.created_by = auth.uid() OR public.is_circle_manager(auth.uid(), r.circle_id))));

-- recipe_favorites policies (private per user)
CREATE POLICY "Users view own favorites" ON public.recipe_favorites FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users add own favorites" ON public.recipe_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.can_access_recipe(auth.uid(), recipe_id));
CREATE POLICY "Users delete own favorites" ON public.recipe_favorites FOR DELETE
  USING (auth.uid() = user_id);