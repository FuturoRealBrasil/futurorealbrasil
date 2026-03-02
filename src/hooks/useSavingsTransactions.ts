import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SavingsTransaction {
  id: string;
  tipo: string;
  valor: number;
  descricao: string | null;
  mes: number;
  ano: number;
  created_at: string;
}

export function useSavingsTransactions(mes: number, ano: number) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("savings_transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("mes", mes)
      .eq("ano", ano)
      .order("created_at", { ascending: false });
    setTransactions((data as unknown as SavingsTransaction[]) || []);
    setLoading(false);
  }, [user, mes, ano]);

  async function logTransaction(tipo: string, valor: number, descricao: string, mes: number, ano: number) {
    if (!user) return;
    await supabase.from("savings_transactions").insert({
      user_id: user.id,
      tipo,
      valor,
      descricao,
      mes,
      ano,
    } as any);
  }

  return { transactions, loading, load, logTransaction };
}
