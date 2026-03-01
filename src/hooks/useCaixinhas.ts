import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Caixinha {
  id: string;
  nome: string;
  imagem_url: string | null;
  valor_atual: number;
  meta_valor: number;
  created_at: string;
}

export function useCaixinhas() {
  const { user } = useAuth();
  const [caixinhas, setCaixinhas] = useState<Caixinha[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setCaixinhas([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("caixinhas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setCaixinhas((data as unknown as Caixinha[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function createCaixinha(nome: string, imageFile?: File, metaValor?: number) {
    if (!user) return;
    let imagem_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("caixinhas").upload(path, imageFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("caixinhas").getPublicUrl(path);
        imagem_url = urlData.publicUrl;
      }
    }

    await supabase.from("caixinhas").insert({
      user_id: user.id, nome, imagem_url, meta_valor: metaValor || 0,
    } as any);
    await load();
  }

  async function updateCaixinha(id: string, nome: string, imageFile?: File, metaValor?: number) {
    if (!user) return;
    const updates: any = { nome };
    if (metaValor !== undefined) updates.meta_valor = metaValor;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("caixinhas").upload(path, imageFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("caixinhas").getPublicUrl(path);
        updates.imagem_url = urlData.publicUrl;
      }
    }

    await supabase.from("caixinhas").update(updates).eq("id", id);
    await load();
  }

  async function deleteCaixinha(id: string) {
    await supabase.from("caixinhas").delete().eq("id", id);
    await load();
  }

  async function addToCaixinha(id: string, valor: number) {
    const cx = caixinhas.find(c => c.id === id);
    if (!cx) return;
    await supabase.from("caixinhas").update({ valor_atual: cx.valor_atual + valor } as any).eq("id", id);
    await load();
  }

  return { caixinhas, loading, createCaixinha, updateCaixinha, deleteCaixinha, addToCaixinha };
}
