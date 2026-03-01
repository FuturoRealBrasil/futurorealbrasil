import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface WeeklyExpense {
  id: string;
  semana: number;
  nome: string;
  valor: number;
  receipt_url: string | null;
  created_at: string;
}

export function useWeeklyExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<WeeklyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    if (!user) { setExpenses([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("weekly_expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setExpenses((data as WeeklyExpense[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  async function addExpense(semana: number, nome: string, valor: number, receiptFile?: File) {
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
      semana,
      nome,
      valor,
      receipt_url,
    });

    await loadExpenses();
  }

  async function deleteExpense(id: string) {
    await supabase.from("weekly_expenses").delete().eq("id", id);
    await loadExpenses();
  }

  const byWeek = (week: number) => expenses.filter((e) => e.semana === week);
  const weekTotal = (week: number) => byWeek(week).reduce((s, e) => s + Number(e.valor), 0);
  const grandTotal = expenses.reduce((s, e) => s + Number(e.valor), 0);

  return { expenses, loading, addExpense, deleteExpense, byWeek, weekTotal, grandTotal };
}
