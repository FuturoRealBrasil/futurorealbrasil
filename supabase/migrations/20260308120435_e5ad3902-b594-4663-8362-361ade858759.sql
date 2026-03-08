
-- Create certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_cpf text NOT NULL,
  verification_code text NOT NULL UNIQUE,
  completion_date timestamp with time zone NOT NULL DEFAULT now(),
  study_hours_total numeric NOT NULL DEFAULT 0,
  modules_completed text[] NOT NULL DEFAULT '{}',
  missions_completed text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can insert their own certificate
CREATE POLICY "Users can insert own certificates" ON public.certificates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON public.certificates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Anyone can verify a certificate by code (public read for verification)
CREATE POLICY "Anyone can verify certificates" ON public.certificates
  FOR SELECT TO anon USING (true);

-- Add CPF field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf text;
