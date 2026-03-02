
-- Add whatsapp column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp text;

-- Create savings transactions log table
CREATE TABLE public.savings_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL, -- 'guardado_add', 'guardado_remove', 'reserva_add', 'reserva_remove'
  valor numeric NOT NULL DEFAULT 0,
  descricao text,
  mes integer NOT NULL,
  ano integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.savings_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.savings_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
