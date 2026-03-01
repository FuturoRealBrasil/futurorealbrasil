import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DailyExpense {
  id: string;
  dia: number;
  nome: string;
  valor: number;
  descricao: string | null;
  receipt_url: string | null;
  created_at: string;
}

export function useDailyExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    if (!user) { setExpenses([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("weekly_expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("dia", { ascending: true });
    setExpenses((data as unknown as DailyExpense[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  async function addExpense(dia: number, nome: string, valor: number, descricao: string, receiptFile?: File) {
    if (!user) return;

    let receipt_url: string | null = null;

    if (receiptFile) {
      const ext = receiptFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("receipts").upload(path, receiptFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);
        receipt_url = urlData.publicUrl;
      }
    }

    await supabase.from("weekly_expenses").insert({
      user_id: user.id,
      dia,
      nome,
      valor,
      descricao,
      receipt_url,
    } as any);

    await loadExpenses();
  }

  async function deleteExpense(id: string) {
    await supabase.from("weekly_expenses").delete().eq("id", id);
    await loadExpenses();
  }

  const byDay = (day: number) => expenses.filter((e) => e.dia === day);
  const dayTotal = (day: number) => byDay(day).reduce((s, e) => s + Number(e.valor), 0);
  const grandTotal = expenses.reduce((s, e) => s + Number(e.valor), 0);

  const daysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  return { expenses, loading, addExpense, deleteExpense, byDay, dayTotal, grandTotal, daysInMonth };
}
