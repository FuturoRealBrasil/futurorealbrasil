import { useState, useRef } from "react";
import { useDailyExpenses } from "@/hooks/useWeeklyExpenses";
import { Plus, Trash2, Receipt, FileText, Pencil, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WeeklyExpensesProps {
  selectedMonth: number;
  selectedYear: number;
}

export default function WeeklyExpenses({ selectedMonth, selectedYear }: WeeklyExpensesProps) {
  const { loading, addExpense, updateExpense, deleteExpense, byDay, dayTotal, grandTotal, daysInMonth } = useDailyExpenses(selectedMonth, selectedYear);
  const [openDay, setOpenDay] = useState<number | null>(new Date().getDate());
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editValor, setEditValor] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const totalDays = daysInMonth();

  async function handleAdd(dia: number) {
    if (!nome.trim()) { toast.error("Informe o nome do gasto"); return; }
    const v = parseFloat(valor.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Informe um valor válido"); return; }
    setSaving(true);
    try {
      await addExpense(dia, nome.trim(), v, descricao.trim(), receiptFile || undefined);
      setNome(""); setValor(""); setDescricao(""); setReceiptFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setAddingDay(null);
      toast.success("Gasto registrado!");
    } catch (err) {
      toast.error("Erro ao salvar gasto");
    }
    setSaving(false);
  }

  async function handleEdit(id: string) {
    if (!editNome.trim()) { toast.error("Informe o nome do gasto"); return; }
    const v = parseFloat(editValor.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Informe um valor válido"); return; }
    setEditSaving(true);
    await updateExpense(id, editNome.trim(), v, editDescricao.trim());
    setEditingId(null);
    setEditSaving(false);
    toast.success("Gasto atualizado!");
  }

  function startEditing(item: { id: string; nome: string; valor: number; descricao: string | null }) {
    setEditingId(item.id);
    setEditNome(item.nome);
    setEditValor(String(item.valor));
    setEditDescricao(item.descricao || "");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const file = e.target.files?.[0] || null;
    setReceiptFile(file);
  }

  if (loading) return null;

  const daysWithExpenses = new Set<number>();
  for (let d = 1; d <= totalDays; d++) {
    if (byDay(d).length > 0) daysWithExpenses.add(d);
  }

  const today = new Date().getDate();
  const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString("pt-BR", { month: "long" });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground capitalize">Gastos de {monthName} {selectedYear}</h2>

      {/* Calendar grid */}
      <div className="bg-card rounded-xl border shadow-sm p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
            const hasExpenses = daysWithExpenses.has(day);
            const isToday = isCurrentMonth && day === today;
            const isSelected = openDay === day;
            return (
              <button
                key={day}
                onClick={() => setOpenDay(isSelected ? null : day)}
                className={`
                  aspect-square rounded-lg text-sm font-medium flex items-center justify-center relative transition-colors
                  ${isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-accent/20 text-accent-foreground font-bold" : "hover:bg-muted/50 text-foreground"}
                `}
              >
                {day}
                {hasExpenses && (
                  <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {openDay && (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-up">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-semibold text-foreground">Dia {openDay}</span>
            <span className="text-sm font-medium text-muted-foreground">
              R$ {dayTotal(openDay).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="px-4 pb-4 pt-2 space-y-2">
            {byDay(openDay).length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nenhum gasto registrado</p>
            )}

            {byDay(openDay).map((item) => (
              <div key={item.id} className="bg-muted/30 rounded-lg p-3">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Nome do gasto" maxLength={100} />
                    <Input value={editValor} onChange={(e) => setEditValor(e.target.value)} placeholder="Valor (R$)" inputMode="decimal" />
                    <Textarea value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} placeholder="Descrição" maxLength={300} rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(item.id)} disabled={editSaving} className="flex-1">
                        {editSaving ? "Salvando..." : <><Check className="w-4 h-4 mr-1" /> Salvar</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.nome}</p>
                      {item.descricao && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.descricao}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs font-semibold text-foreground">
                          R$ {Number(item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        {item.receipt_url && (
                          <a href={item.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => startEditing(item)} className="text-muted-foreground hover:text-primary p-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteExpense(item.id)} className="text-muted-foreground hover:text-destructive p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {addingDay === openDay ? (
              <div className="space-y-2 pt-2 border-t">
                <Input placeholder="Nome do gasto" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} />
                <Input placeholder="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" />
                <Textarea placeholder="Descrição (ex: Comprei neste dia...)" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={300} rows={2} />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
                    <Receipt className="w-4 h-4" />
                    <span>{receiptFile ? receiptFile.name : "Anexar nota fiscal"}</span>
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => handleAdd(openDay)} disabled={saving} className="flex-1">
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => { setAddingDay(null); setNome(""); setValor(""); setDescricao(""); setReceiptFile(null); }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingDay(openDay)} className="flex items-center gap-2 text-sm text-primary font-medium hover:underline pt-1">
                <Plus className="w-4 h-4" /> Adicionar gasto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grand total summary */}
      <div className="bg-card rounded-xl border shadow-sm p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground">Total do Mês</span>
          <span className="text-lg font-black text-foreground">
            R$ {grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
