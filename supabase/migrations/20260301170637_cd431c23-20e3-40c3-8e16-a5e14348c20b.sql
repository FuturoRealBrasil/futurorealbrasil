
-- Add month/year to weekly_expenses for historical navigation
ALTER TABLE public.weekly_expenses ADD COLUMN mes integer NOT NULL DEFAULT EXTRACT(MONTH FROM now())::integer;
ALTER TABLE public.weekly_expenses ADD COLUMN ano integer NOT NULL DEFAULT EXTRACT(YEAR FROM now())::integer;

-- Create caixinhas (savings boxes) table
CREATE TABLE public.caixinhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  imagem_url text,
  valor_atual numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.caixinhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own caixinhas" ON public.caixinhas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own caixinhas" ON public.caixinhas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own caixinhas" ON public.caixinhas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own caixinhas" ON public.caixinhas FOR DELETE USING (auth.uid() = user_id);

-- Monthly savings tracking
CREATE TABLE public.monthly_savings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mes integer NOT NULL,
  ano integer NOT NULL,
  valor_guardado numeric NOT NULL DEFAULT 0,
  valor_reserva numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes, ano)
);

ALTER TABLE public.monthly_savings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own monthly_savings" ON public.monthly_savings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own monthly_savings" ON public.monthly_savings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monthly_savings" ON public.monthly_savings FOR UPDATE USING (auth.uid() = user_id);

-- Storage bucket for caixinha images
INSERT INTO storage.buckets (id, name, public) VALUES ('caixinhas', 'caixinhas', true);

CREATE POLICY "Users can upload caixinha images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'caixinhas' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view caixinha images" ON storage.objects FOR SELECT USING (bucket_id = 'caixinhas');
CREATE POLICY "Users can delete own caixinha images" ON storage.objects FOR DELETE USING (bucket_id = 'caixinhas' AND auth.role() = 'authenticated');
