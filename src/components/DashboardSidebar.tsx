import { useState } from "react";
import { Shield, Plus, Trash2, CheckCircle2, Circle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebts, Debt } from "@/hooks/useDebts";
import { toast } from "sonner";
import { FinancialData } from "@/hooks/useFinancialData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WeeklyExpenses from "@/components/WeeklyExpenses";
import Caixinhas from "@/components/Caixinhas";

interface Props {
  open: boolean;
  onClose: () => void;
  data: FinancialData;
  saldo: number;
  onUpdateRenda: (val: number) => void;
  onUpdateGastos: (val: number) => void;
  selectedMonth: number;
  selectedYear: number;
}

export default function DashboardSidebar({ open, onClose, data, saldo, onUpdateRenda, onUpdateGastos, selectedMonth, selectedYear }: Props) {
  const { debts, addDebt, toggleDebtStatus, deleteDebt } = useDebts();
  const [newDebtName, setNewDebtName] = useState("");
  const [newDebtValue, setNewDebtValue] = useState("");
  const [showAddDebt, setShowAddDebt] = useState(false);

  const [editField, setEditField] = useState<"renda" | "gastos" | null>(null);
  const [editValue, setEditValue] = useState("");

  async function handleAddDebt() {
    if (!newDebtName.trim()) { toast.error("Nome obrigatório"); return; }
    const v = parseFloat(newDebtValue.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Valor inválido"); return; }
    await addDebt(newDebtName.trim(), v);
    setNewDebtName("");
    setNewDebtValue("");
    setShowAddDebt(false);
    toast.success("Dívida adicionada!");
  }

  function handleEditConfirm() {
    const v = parseFloat(editValue.replace(",", "."));
    if (isNaN(v) || v < 0) { toast.error("Valor inválido"); return; }
    if (editField === "renda") onUpdateRenda(v);
    else if (editField === "gastos") onUpdateGastos(v);
    setEditField(null);
    setEditValue("");
  }

  const pendingDebts = debts.filter(d => d.status === "pendente");
  const paidDebts = debts.filter(d => d.status === "pago");
  const totalPending = pendingDebts.reduce((s, d) => s + d.valor, 0);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Sidebar panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-l shadow-2xl z-50 overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-sm font-extrabold text-foreground">Painel Financeiro</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div className="p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setEditField("renda"); setEditValue(String(data.renda)); }}
              className="bg-muted/50 rounded-lg p-3 text-left hover:bg-muted transition-colors"
            >
              <p className="text-[10px] text-muted-foreground font-medium">Renda</p>
              <p className="text-sm font-bold text-foreground">R$ {data.renda.toLocaleString("pt-BR")}</p>
              <p className="text-[9px] text-primary mt-1">Toque para atualizar</p>
            </button>
            <button
              onClick={() => { setEditField("gastos"); setEditValue(String(data.gastos)); }}
              className="bg-muted/50 rounded-lg p-3 text-left hover:bg-muted transition-colors"
            >
              <p className="text-[10px] text-muted-foreground font-medium">Gastos</p>
              <p className="text-sm font-bold text-foreground">R$ {data.gastos.toLocaleString("pt-BR")}</p>
              <p className="text-[9px] text-primary mt-1">Toque para atualizar</p>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground font-medium">Saldo</p>
              <p className={`text-sm font-bold ${saldo >= 0 ? "text-safe" : "text-danger"}`}>
                R$ {saldo.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground font-medium">Reserva</p>
              <p className="text-sm font-bold text-foreground">
                {data.temReserva ? `R$ ${data.valorReserva.toLocaleString("pt-BR")}` : "Nenhuma"}
              </p>
            </div>
          </div>
        </div>

        {/* Debts Section */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-danger" /> Dívidas
            </h3>
            <button
              onClick={() => setShowAddDebt(true)}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Adicionar
            </button>
          </div>

          {totalPending > 0 && (
            <div className="bg-danger/5 border border-danger/20 rounded-lg p-2 mb-3">
              <p className="text-[10px] text-muted-foreground">Total pendente</p>
              <p className="text-sm font-bold text-danger">
                R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Pending debts */}
          {pendingDebts.length > 0 && (
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pendentes</p>
              {pendingDebts.map(d => (
                <DebtItem key={d.id} debt={d} onToggle={toggleDebtStatus} onDelete={deleteDebt} />
              ))}
            </div>
          )}

          {/* Paid debts */}
          {paidDebts.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pagas</p>
              {paidDebts.map(d => (
                <DebtItem key={d.id} debt={d} onToggle={toggleDebtStatus} onDelete={deleteDebt} />
              ))}
            </div>
          )}

          {debts.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhuma dívida cadastrada 🎉</p>
          )}
        </div>
      </div>

      {/* Add Debt Dialog */}
      <Dialog open={showAddDebt} onOpenChange={setShowAddDebt}>
        <DialogContent className="max-w-sm rounded-2xl z-[60]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Nova Dívida</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input placeholder="Ex: Cartão de crédito" value={newDebtName} onChange={e => setNewDebtName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Valor</label>
              <Input placeholder="R$ 0,00" value={newDebtValue} onChange={e => setNewDebtValue(e.target.value)} inputMode="decimal" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddDebt(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleAddDebt} className="flex-1">Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Renda/Gastos Dialog */}
      <Dialog open={editField !== null} onOpenChange={() => setEditField(null)}>
        <DialogContent className="max-w-sm rounded-2xl z-[60]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Atualizar {editField === "renda" ? "Renda" : "Gastos"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">
                {editField === "renda" ? "Nova renda mensal" : "Novos gastos fixos"}
              </label>
              <Input placeholder="R$ 0,00" value={editValue} onChange={e => setEditValue(e.target.value)} inputMode="decimal" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditField(null)} className="flex-1">Cancelar</Button>
              <Button onClick={handleEditConfirm} className="flex-1">Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DebtItem({ debt, onToggle, onDelete }: { debt: Debt; onToggle: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  const isPaid = debt.status === "pago";
  return (
    <div className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isPaid ? "bg-safe/5" : "bg-muted/30"}`}>
      <button
        onClick={() => onToggle(debt.id, debt.status)}
        className="shrink-0"
        title={isPaid ? "Marcar como pendente" : "Marcar como paga"}
      >
        {isPaid
          ? <CheckCircle2 className="w-5 h-5 text-safe" />
          : <Circle className="w-5 h-5 text-muted-foreground" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${isPaid ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {debt.nome}
        </p>
        <p className={`text-[10px] ${isPaid ? "text-muted-foreground" : "text-danger"}`}>
          R$ {debt.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
      <button onClick={() => onDelete(debt.id)} className="shrink-0 p-1 text-muted-foreground hover:text-danger transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
