import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useMonthlySavings } from "@/hooks/useMonthlySavings";
import { useSavingsTransactions } from "@/hooks/useSavingsTransactions";
import { useAuth } from "@/hooks/useAuth";
import { PiggyBank, ChevronRight, ChevronLeft, DollarSign, Minus, Shield, ArrowLeft, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { generateTransactionsPDF } from "@/lib/pdfGenerator";

const Reserva = () => {
  const navigate = useNavigate();
  const { data, loading, saveData } = useFinancialData();
  const { user } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { saving: monthlySaving, addReserve, removeReserve } = useMonthlySavings(selectedMonth, selectedYear);
  const { transactions, load: loadTransactions, logTransaction } = useSavingsTransactions(selectedMonth, selectedYear);

  const [reserveDialog, setReserveDialog] = useState<"add" | "remove" | null>(null);
  const [reserveValue, setReserveValue] = useState("");
  const [reserveDesc, setReserveDesc] = useState("");

  useEffect(() => {
    if (!loading && !data.onboardingDone) {
      navigate("/cadastro");
    }
  }, [loading, data.onboardingDone, navigate]);

  if (loading || !data.onboardingDone) return null;

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString("pt-BR", { month: "long" });

  function prevMonth() {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
  }
  function nextMonth() {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  }

  async function handleReserveConfirm() {
    const v = parseFloat(reserveValue.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Valor inválido"); return; }
    if (reserveDialog === "add") {
      await addReserve(v);
      await saveData({ temReserva: true, valorReserva: data.valorReserva + v });
      await logTransaction("reserva_add", v, reserveDesc || "Reserva adicionada", selectedMonth, selectedYear);
      toast.success("Reserva atualizada!");
    } else {
      await removeReserve(v);
      await saveData({ valorReserva: Math.max(0, data.valorReserva - v) });
      await logTransaction("reserva_remove", v, reserveDesc || "Reserva retirada", selectedMonth, selectedYear);
      toast.success("Reserva reduzida!");
    }
    setReserveValue(""); setReserveDesc(""); setReserveDialog(null);
  }

  async function handleDownloadPDF() {
    const txs = await loadTransactions();
    const reserveTxs = (txs || []).filter(t => t.tipo.startsWith("reserva"));
    generateTransactionsPDF(reserveTxs, monthName, selectedYear);
    toast.success("PDF baixado!");
  }

  const idealReserve = data.gastos * 6;
  const currentReserve = data.valorReserva || 0;
  const reserveProgress = idealReserve > 0 ? Math.min(100, (currentReserve / idealReserve) * 100) : 0;
  const diasSobrevivencia = data.gastos > 0 ? Math.round((currentReserve / data.gastos) * 30) : 0;

  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6 text-brand-gold" /> Reserva de Emergência
        </h1>
        <p className="text-sm text-muted-foreground mb-6">Sua rede de segurança financeira</p>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-card rounded-xl border shadow-sm p-3 mb-6">
          <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-foreground capitalize">{monthName} {selectedYear}</span>
          <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Reserve Total */}
        <div className="bg-card rounded-2xl p-6 border shadow-sm mb-6 text-center animate-fade-up">
          <PiggyBank className="w-10 h-10 text-brand-gold mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Reserva Total Acumulada</p>
          <p className="text-3xl font-black text-brand-gold">
            R$ {currentReserve.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {diasSobrevivencia > 0 ? `Cobre ${diasSobrevivencia} dias de despesas` : "Sem reserva ainda"}
          </p>
        </div>

        {/* Progress toward ideal reserve */}
        <div className="bg-card rounded-2xl p-5 border shadow-sm mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">Meta: 6 meses de gastos</span>
            <span className="text-xs text-muted-foreground">
              R$ {currentReserve.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} / R$ {idealReserve.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500"
              style={{ width: `${reserveProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {reserveProgress >= 100
              ? "🎉 Parabéns! Você atingiu a meta de 6 meses!"
              : reserveProgress >= 50
                ? `${Math.round(reserveProgress)}% da meta — continue assim!`
                : `${Math.round(reserveProgress)}% da meta — cada real conta!`}
          </p>
        </div>

        {/* Monthly reserve card */}
        <div className="bg-card rounded-xl p-4 border shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-4 h-4 text-brand-gold" />
            <p className="text-xs text-muted-foreground font-medium">Reserva adicionada em {monthName}</p>
          </div>
          <p className="text-lg font-bold text-brand-gold">
            R$ {(monthlySaving?.valor_reserva || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => { setReserveDialog("add"); setReserveValue(""); setReserveDesc(""); }} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Adicionar
            </button>
            <button onClick={() => { setReserveDialog("remove"); setReserveValue(""); setReserveDesc(""); }} className="text-xs text-destructive font-medium hover:underline flex items-center gap-1">
              <Minus className="w-3 h-3" /> Retirar
            </button>
          </div>
        </div>

        {/* PDF Download */}
        <button onClick={handleDownloadPDF} className="w-full bg-card rounded-xl p-3 border shadow-sm flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors mb-6">
          <FileDown className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Baixar Relatório PDF de {monthName}</span>
        </button>

        {/* Tips */}
        <div className="bg-safe/5 border border-safe/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">💡 Dicas para sua Reserva</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• O ideal é ter <strong>3 a 6 meses</strong> de gastos essenciais guardados</li>
            <li>• Guarde em investimentos com <strong>liquidez diária</strong> (CDB, Tesouro Selic)</li>
            <li>• NÃO use a reserva para compras — apenas emergências reais</li>
            <li>• Configure uma transferência automática mensal</li>
            <li>• Se usar parte, reponha o mais rápido possível</li>
          </ul>
        </div>
      </div>

      {/* Reserve Dialog */}
      <Dialog open={reserveDialog !== null} onOpenChange={() => setReserveDialog(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Movimentar Reserva</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setReserveDialog("add")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${reserveDialog === "add" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Adicionar
            </button>
            <button
              onClick={() => setReserveDialog("remove")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${reserveDialog === "remove" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Retirar
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Valor</label>
              <Input placeholder="R$ 0,00" value={reserveValue} onChange={(e) => setReserveValue(e.target.value)} inputMode="decimal" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setReserveDialog(null)} className="flex-1">Cancelar</Button>
              <Button onClick={handleReserveConfirm} className="flex-1">Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Reserva;
