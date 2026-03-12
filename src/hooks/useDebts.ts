import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Debt {
  id: string;
  nome: string;
  valor: number;
  status: "pendente" | "pago";
  created_at: string;
}

export function useDebts() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setDebts([]); setLoading(false); return; }
    loadDebts();
  }, [user]);

  async function loadDebts() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setDebts((data as Debt[]) || []);
    setLoading(false);
  }

  async function addDebt(nome: string, valor: number) {
    if (!user) return;
    await supabase.from("debts").insert({ user_id: user.id, nome, valor, status: "pendente" });
    await loadDebts();
  }

  async function toggleDebtStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "pendente" ? "pago" : "pendente";
    await supabase.from("debts").update({ status: newStatus }).eq("id", id);
    await loadDebts();
  }

  async function deleteDebt(id: string) {
    await supabase.from("debts").delete().eq("id", id);
    await loadDebts();
  }

  return { debts, loading, addDebt, toggleDebtStatus, deleteDebt };
}
