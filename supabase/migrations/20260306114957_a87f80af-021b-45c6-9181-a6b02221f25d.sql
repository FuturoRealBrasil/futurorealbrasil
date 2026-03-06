ALTER TABLE public.weekly_expenses DROP CONSTRAINT weekly_expenses_semana_check;
ALTER TABLE public.weekly_expenses ADD CONSTRAINT weekly_expenses_dia_check CHECK (dia >= 1 AND dia <= 31);