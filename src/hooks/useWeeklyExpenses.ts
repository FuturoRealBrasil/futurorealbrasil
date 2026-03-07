import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DailyExpense {
  id: string;
  dia: number;
  mes: number;
  ano: number;
  nome: string;
  valor: number;
  descricao: string | null;
  receipt_url: string | null;
  created_at: string;
}

export function useDailyExpenses(selectedMonth?: number, selectedYear?: number) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const mes = selectedMonth ?? now.getMonth() + 1;
  const ano = selectedYear ?? now.getFullYear();

  const loadExpenses = useCallback(async () => {
    if (!user) { setExpenses([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("weekly_expenses")
      .select("*")
      .eq("user_id", user.id)
      .eq("mes", mes)
      .eq("ano", ano)
      .order("dia", { ascending: true });
    setExpenses((data as unknown as DailyExpense[]) || []);
    setLoading(false);
  }, [user, mes, ano]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  async function addExpense(dia: number, nome: string, valor: number, descricao: string, receiptFile?: File) {
    if (!user) return;

    let receipt_url: string | null = null;

    if (receiptFile) {
      try {
        const ext = receiptFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("receipts").upload(path, receiptFile);
        if (uploadError) {
          console.error("Upload error:", uploadError);
          // Continue without receipt - don't block the expense save
        } else {
          const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);
          receipt_url = urlData.publicUrl;
        }
      } catch (e) {
        console.error("Receipt upload failed:", e);
        // Continue without receipt
      }
    }

    const { error } = await supabase.from("weekly_expenses").insert({
      user_id: user.id,
      dia,
      mes,
      ano,
      nome,
      valor,
      descricao: descricao || null,
      receipt_url,
    } as any);

    if (error) {
      console.error("Insert expense error:", error);
      throw error;
    }

    await loadExpenses();
  }

  async function updateExpense(id: string, nome: string, valor: number, descricao: string) {
    await supabase.from("weekly_expenses").update({ nome, valor, descricao } as any).eq("id", id);
    await loadExpenses();
  }

  async function deleteExpense(id: string) {
    await supabase.from("weekly_expenses").delete().eq("id", id);
    await loadExpenses();
  }

  const byDay = (day: number) => expenses.filter((e) => e.dia === day);
  const dayTotal = (day: number) => byDay(day).reduce((s, e) => s + Number(e.valor), 0);
  const grandTotal = expenses.reduce((s, e) => s + Number(e.valor), 0);

  const daysInMonth = () => new Date(ano, mes, 0).getDate();

  return { expenses, loading, addExpense, updateExpense, deleteExpense, byDay, dayTotal, grandTotal, daysInMonth, mes, ano };
}
