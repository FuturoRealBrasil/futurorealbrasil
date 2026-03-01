
ALTER TABLE public.weekly_expenses RENAME COLUMN semana TO dia;
ALTER TABLE public.weekly_expenses ADD COLUMN descricao text;
