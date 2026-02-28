import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FinancialData {
  renda: number;
  gastos: number;
  temDividas: boolean;
  dependentes: number;
  temReserva: boolean;
  valorReserva: number;
  completedMissions: string[];
  onboardingDone: boolean;
}

const defaultData: FinancialData = {
  renda: 0,
  gastos: 0,
  temDividas: false,
  dependentes: 0,
  temReserva: false,
  valorReserva: 0,
  completedMissions: [],
  onboardingDone: false,
};

export function useFinancialData() {
  const { user } = useAuth();
  const [data, setData] = useState<FinancialData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(defaultData);
      setLoading(false);
      return;
    }
    loadData(user.id);
  }, [user]);

  async function loadData(userId: string) {
    setLoading(true);
    const { data: row } = await supabase
      .from("user_financial_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (row) {
      setData({
        renda: Number(row.renda) || 0,
        gastos: Number(row.gastos) || 0,
        temDividas: row.tem_dividas ?? false,
        dependentes: row.dependentes ?? 0,
        temReserva: row.tem_reserva ?? false,
        valorReserva: Number(row.valor_reserva) || 0,
        completedMissions: row.completed_missions || [],
        onboardingDone: row.onboarding_done ?? false,
      });
    }
    setLoading(false);
  }

  async function saveData(updates: Partial<FinancialData>) {
    if (!user) return;

    const merged = { ...data, ...updates };
    setData(merged);

    const dbRow = {
      user_id: user.id,
      renda: merged.renda,
      gastos: merged.gastos,
      tem_dividas: merged.temDividas,
      dependentes: merged.dependentes,
      tem_reserva: merged.temReserva,
      valor_reserva: merged.valorReserva,
      completed_missions: merged.completedMissions,
      onboarding_done: merged.onboardingDone,
    };

    const { data: existing } = await supabase
      .from("user_financial_data")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      await supabase
        .from("user_financial_data")
        .update(dbRow)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("user_financial_data")
        .insert(dbRow);
    }

    return merged;
  }

  return { data, loading, saveData };
}

export function calcularFuturo(data: FinancialData) {
  const saldo = data.renda - data.gastos;
  const mesesAteCrise = saldo > 0 ? Infinity : saldo === 0 ? 0 : Math.abs(data.valorReserva / saldo);
  const diasSemDinheiro = data.valorReserva > 0 ? Math.round((data.valorReserva / data.gastos) * 30) : 0;

  const score = Math.min(100, Math.max(0,
    (saldo > 0 ? 30 : 0) +
    (data.temReserva ? 25 : 0) +
    (!data.temDividas ? 20 : 0) +
    (data.dependentes <= 1 ? 15 : data.dependentes <= 3 ? 8 : 0) +
    (saldo > data.renda * 0.2 ? 10 : saldo > 0 ? 5 : 0)
  ));

  return { saldo, mesesAteCrise, diasSemDinheiro, score };
}
