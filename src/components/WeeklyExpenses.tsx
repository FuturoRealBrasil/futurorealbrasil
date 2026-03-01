import { useState, useRef } from "react";
import { useWeeklyExpenses } from "@/hooks/useWeeklyExpenses";
import { Plus, Trash2, Receipt, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WEEKS = [1, 2, 3, 4] as const;

export default function WeeklyExpenses() {
  const { loading, addExpense, deleteExpense, byWeek, weekTotal, grandTotal } = useWeeklyExpenses();
  const [openWeek, setOpenWeek] = useState<number | null>(1);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [addingWeek, setAddingWeek] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  async function handleAdd(semana: number) {
    if (!nome.trim()) { toast.error("Informe o nome do gasto"); return; }
    const v = parseFloat(valor.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Informe um valor válido"); return; }
    setSaving(true);
    await addExpense(semana, nome.trim(), v, receiptFile || undefined);
    setNome("");
    setValor("");
    setReceiptFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setAddingWeek(null);
    setSaving(false);
    toast.success("Gasto registrado!");
  }

  if (loading) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Gastos Semanais</h2>

      {WEEKS.map((week) => {
        const items = byWeek(week);
        const total = weekTotal(week);
        const isOpen = openWeek === week;

        return (
          <div key={week} className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenWeek(isOpen ? null : week)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold text-foreground">Semana {week}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Nenhum gasto registrado</p>
                )}

                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.nome}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          R$ {Number(item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        {item.receipt_url && (
                          <a href={item.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteExpense(item.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {addingWeek === week ? (
                  <div className="space-y-2 pt-2 border-t">
                    <Input
                      placeholder="Nome do gasto"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      maxLength={100}
                    />
                    <Input
                      placeholder="Valor (R$)"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      inputMode="decimal"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                        <Receipt className="w-4 h-4" />
                        <span>{receiptFile ? receiptFile.name : "Anexar nota fiscal"}</span>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAdd(week)} disabled={saving} className="flex-1">
                        {saving ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setAddingWeek(null); setNome(""); setValor(""); setReceiptFile(null); }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingWeek(week)}
                    className="flex items-center gap-2 text-sm text-primary font-medium hover:underline pt-1"
                  >
                    <Plus className="w-4 h-4" /> Adicionar gasto
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Grand total summary */}
      <div className="bg-card rounded-xl border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-foreground">Total do Mês</span>
          <span className="text-lg font-black text-foreground">
            R$ {grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="space-y-1">
          {WEEKS.map((week) => (
            <div key={week} className="flex justify-between text-sm">
              <span className="text-muted-foreground">Semana {week}</span>
              <span className="font-medium text-foreground">
                R$ {weekTotal(week).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
