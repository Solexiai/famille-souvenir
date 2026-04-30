
-- ============ media_items ============
CREATE TABLE public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo','video')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  width INT,
  height INT,
  duration_seconds INT,
  taken_at TIMESTAMPTZ,
  caption TEXT DEFAULT '',
  album_label TEXT,
  source_folder TEXT,
  processing_status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_items_circle_taken ON public.media_items(circle_id, taken_at DESC NULLS LAST, created_at DESC);
CREATE INDEX idx_media_items_uploader ON public.media_items(uploaded_by);

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view circle media"
  ON public.media_items FOR SELECT
  USING (public.is_circle_member(auth.uid(), circle_id));

CREATE POLICY "Members insert media"
  ON public.media_items FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by AND public.is_circle_member(auth.uid(), circle_id));

CREATE POLICY "Uploader updates own media"
  ON public.media_items FOR UPDATE
  USING (uploaded_by = auth.uid() OR public.has_circle_role(auth.uid(), circle_id, 'owner'::app_role));

CREATE POLICY "Uploader or owner deletes media"
  ON public.media_items FOR DELETE
  USING (uploaded_by = auth.uid() OR public.has_circle_role(auth.uid(), circle_id, 'owner'::app_role));

CREATE TRIGGER trg_media_items_updated
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ storage_plans ============
CREATE TABLE public.storage_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  storage_gb INT NOT NULL,
  price_annual_cad NUMERIC(10,2),
  price_30_years_cad NUMERIC(10,2),
  is_free BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.storage_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view plans"
  ON public.storage_plans FOR SELECT
  USING (auth.uid() IS NOT NULL);

INSERT INTO public.storage_plans (code, label, storage_gb, price_annual_cad, price_30_years_cad, is_free, sort_order) VALUES
  ('free_5gb',    'Gratuit',  5,    NULL,    NULL,    true,  0),
  ('paid_100gb',  '100 Go',   100,  20.00,   200.00,  false, 1),
  ('paid_500gb',  '500 Go',   500,  60.00,   600.00,  false, 2),
  ('paid_2tb',    '2 To',     2048, 150.00,  1500.00, false, 3);

-- ============ user_storage (par cercle) ============
CREATE TABLE public.user_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL UNIQUE,
  plan_code TEXT NOT NULL DEFAULT 'free_5gb' REFERENCES public.storage_plans(code),
  quota_bytes BIGINT NOT NULL DEFAULT 5368709120, -- 5 Go
  used_bytes BIGINT NOT NULL DEFAULT 0,
  billing_cycle TEXT, -- 'annual' | '30_years' | NULL pour gratuit
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_storage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view circle storage"
  ON public.user_storage FOR SELECT
  USING (public.is_circle_member(auth.uid(), circle_id));

CREATE POLICY "Service role manages storage"
  ON public.user_storage FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_user_storage_updated
  BEFORE UPDATE ON public.user_storage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed user_storage pour les cercles existants
INSERT INTO public.user_storage (circle_id, plan_code, quota_bytes)
SELECT id, 'free_5gb', 5368709120 FROM public.family_circles
ON CONFLICT (circle_id) DO NOTHING;

-- Trigger : créer une ligne user_storage quand un cercle est créé
CREATE OR REPLACE FUNCTION public.create_default_storage_for_circle()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_storage (circle_id, plan_code, quota_bytes)
  VALUES (NEW.id, 'free_5gb', 5368709120)
  ON CONFLICT (circle_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_circle_default_storage
  AFTER INSERT ON public.family_circles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_storage_for_circle();

-- Trigger : mettre à jour used_bytes quand un media est ajouté/supprimé
CREATE OR REPLACE FUNCTION public.update_circle_used_bytes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_storage
       SET used_bytes = used_bytes + NEW.file_size
     WHERE circle_id = NEW.circle_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_storage
       SET used_bytes = GREATEST(0, used_bytes - OLD.file_size)
     WHERE circle_id = OLD.circle_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_media_items_quota_insert
  AFTER INSERT ON public.media_items
  FOR EACH ROW EXECUTE FUNCTION public.update_circle_used_bytes();

CREATE TRIGGER trg_media_items_quota_delete
  AFTER DELETE ON public.media_items
  FOR EACH ROW EXECUTE FUNCTION public.update_circle_used_bytes();

-- ============ Storage bucket family-media ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-media', 'family-media', false)
ON CONFLICT (id) DO NOTHING;

-- Path convention: {circle_id}/{media_id}/{filename}
CREATE POLICY "Members read circle media files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'family-media'
    AND public.is_circle_member(
      auth.uid(),
      ((storage.foldername(name))[1])::uuid
    )
  );

CREATE POLICY "Members upload circle media files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'family-media'
    AND public.is_circle_member(
      auth.uid(),
      ((storage.foldername(name))[1])::uuid
    )
  );

CREATE POLICY "Uploader or owner deletes media files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'family-media'
    AND public.is_circle_member(
      auth.uid(),
      ((storage.foldername(name))[1])::uuid
    )
  );
