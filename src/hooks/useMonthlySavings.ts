import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MonthlySaving {
  id: string;
  mes: number;
  ano: number;
  valor_guardado: number;
  valor_reserva: number;
}

export function useMonthlySavings(mes: number, ano: number) {
  const { user } = useAuth();
  const [saving, setSaving] = useState<MonthlySaving | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setSaving(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("monthly_savings")
      .select("*")
      .eq("user_id", user.id)
      .eq("mes", mes)
      .eq("ano", ano)
      .single();
    setSaving(data as unknown as MonthlySaving | null);
    setLoading(false);
  }, [user, mes, ano]);

  useEffect(() => { load(); }, [load]);

  async function addSaving(valor: number) {
    if (!user) return;
    const current = saving?.valor_guardado || 0;
    const newVal = current + valor;

    if (saving) {
      await supabase.from("monthly_savings").update({ valor_guardado: newVal } as any).eq("id", saving.id);
    } else {
      await supabase.from("monthly_savings").insert({
        user_id: user.id, mes, ano, valor_guardado: newVal, valor_reserva: 0,
      } as any);
    }
    await load();
  }

  async function addReserve(valor: number) {
    if (!user) return;
    const current = saving?.valor_reserva || 0;
    const newVal = current + valor;

    if (saving) {
      await supabase.from("monthly_savings").update({ valor_reserva: newVal } as any).eq("id", saving.id);
    } else {
      await supabase.from("monthly_savings").insert({
        user_id: user.id, mes, ano, valor_guardado: 0, valor_reserva: newVal,
      } as any);
    }
    await load();
  }

  return { saving, loading, addSaving, addReserve };
}
