import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinancialData, calcularFuturo } from "@/hooks/useFinancialData";
import { useMonthlySavings } from "@/hooks/useMonthlySavings";
import { useSavingsTransactions } from "@/hooks/useSavingsTransactions";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, Shield, ChevronRight, ChevronLeft, Wallet, DollarSign, Minus, FileDown, TrendingUp, PanelRightOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InvestmentProjection from "@/components/InvestmentProjection";
import AppLayout from "@/components/AppLayout";
import WeeklyExpenses from "@/components/WeeklyExpenses";
import Caixinhas from "@/components/Caixinhas";
import DashboardSidebar from "@/components/DashboardSidebar";
import { toast } from "sonner";
import { generateTransactionsPDF } from "@/lib/pdfGenerator";
import logo from "@/assets/logo-transparent.png";
import HamburgerMenu from "@/components/HamburgerMenu";


// Digital clock component
function DigitalClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const monthYear = now.toLocaleString("pt-BR", { month: "long", year: "numeric" });
  return (
    <div className="text-right">
      <p className="text-lg md:text-xl font-mono font-bold text-primary-foreground tracking-wider">
        {hours}:{minutes}<span className="text-primary-foreground/50">:{seconds}</span>
      </p>
      <p className="text-[10px] md:text-xs text-primary-foreground/60 capitalize">{monthYear}</p>
    </div>
  );
}

function ScoreEmoji({ score }: { score: number }) {
  let emoji: string;
  if (score >= 80) emoji = "😄";
  else if (score >= 60) emoji = "🙂";
  else if (score >= 50) emoji = "😐";
  else if (score >= 30) emoji = "😟";
  else if (score >= 15) emoji = "😢";
  else emoji = "😰";
  return <span className="text-3xl md:text-4xl">{emoji}</span>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, loading, saveData } = useFinancialData();
  const { signOut, isPremium } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedInvestment, setSelectedInvestment] = useState("cdb");

  const { saving: monthlySaving, addSaving, removeSaving } = useMonthlySavings(selectedMonth, selectedYear);
  const { transactions, load: loadTransactions, logTransaction } = useSavingsTransactions(selectedMonth, selectedYear);

  const [savingDialog, setSavingDialog] = useState<"add" | "remove" | null>(null);
  const [savingValue, setSavingValue] = useState("");
  const [savingDesc, setSavingDesc] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !data.onboardingDone) {
      navigate("/cadastro");
    }
  }, [loading, data.onboardingDone, navigate]);

  if (loading || !data.onboardingDone) return null;

  const { saldo, diasSemDinheiro, score } = calcularFuturo(data);
  const scoreColor = score >= 60 ? "text-safe" : score >= 30 ? "text-warning" : "text-danger";
  const scoreBg = score >= 60 ? "bg-safe" : score >= 30 ? "bg-warning" : "bg-danger";

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString("pt-BR", { month: "long" });

  function prevMonth() {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
  }
  function nextMonth() {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  }

  async function handleSavingConfirm() {
    const v = parseFloat(savingValue.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Valor inválido"); return; }
    if (savingDialog === "add") {
      await addSaving(v);
      await logTransaction("guardado_add", v, savingDesc || "Investimento adicionado", selectedMonth, selectedYear);
      toast.success("Investimento adicionado!");
    } else {
      await removeSaving(v);
      await logTransaction("guardado_remove", v, savingDesc || "Investimento retirado", selectedMonth, selectedYear);
      toast.success("Valor retirado!");
    }
    setSavingValue(""); setSavingDesc(""); setSavingDialog(null);
  }

  async function handleDownloadPDF() {
    const txs = await loadTransactions();
    generateTransactionsPDF(txs || [], monthName, selectedYear);
    toast.success("PDF baixado!");
  }

  async function handleUpdateRenda() {
    const v = parseFloat(newRenda.replace(",", "."));
    if (isNaN(v) || v < 0) { toast.error("Valor inválido"); return; }
    await saveData({ renda: v });
    setNewRenda(""); setShowUpdateRenda(false);
    toast.success("Renda atualizada!");
  }

  async function handleUpdateGastos() {
    const v = parseFloat(newGastos.replace(",", "."));
    if (isNaN(v) || v < 0) { toast.error("Valor inválido"); return; }
    await saveData({ gastos: v });
    setNewGastos(""); setShowUpdateGastos(false);
    toast.success("Gastos atualizados!");
  }

  const investmentMonthly = monthlySaving?.valor_guardado || 0;

  const alerts: { text: string; type: "safe" | "warning" | "danger" }[] = [];
  if (saldo < 0) {
    const meses = Math.ceil(Math.abs((data.valorReserva || 0) / saldo));
    alerts.push({
      text: `Suas despesas ultrapassam sua renda. ${data.valorReserva > 0 ? `Sua reserva acaba em ${meses} meses.` : "Sem reserva, qualquer imprevisto é crítico."}`,
      type: "danger",
    });
  } else if (saldo === 0) {
    alerts.push({ text: "Você está gastando tudo que ganha. Sem margem para imprevistos.", type: "warning" });
  } else {
    alerts.push({ text: `Você consegue guardar R$ ${saldo.toFixed(0)}/mês. Continue assim!`, type: "safe" });
  }

  if (!data.temReserva) {
    alerts.push({ text: "Uma emergência hoje te deixaria sem dinheiro imediatamente.", type: "danger" });
  } else if (diasSemDinheiro < 90) {
    alerts.push({ text: `Uma emergência hoje te deixaria sem dinheiro em ${diasSemDinheiro} dias.`, type: "warning" });
  }

  return (
    <AppLayout hideMenu>
      <div className="min-h-screen relative">
        {/* Dark gradient header */}
        <div className="bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)] px-5 pt-6 pb-10 relative">
          <div className="max-w-lg md:max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain shrink-0 drop-shadow-lg" />
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-extrabold text-primary-foreground leading-tight truncate">Seu Futuro</h1>
                <p className="text-xs md:text-sm text-primary-foreground/60 truncate">Gestão Financeira</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DigitalClock />
              <HamburgerMenu />
            </div>
          </div>
        </div>

        <div className="px-5 pb-24 -mt-4 max-w-lg md:max-w-5xl mx-auto relative z-10">

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

        {/* Desktop: Score + Alerts side by side */}
        <div className="md:grid md:grid-cols-2 md:gap-6 mb-6">
          <div className="bg-card rounded-2xl p-6 border shadow-sm mb-6 md:mb-0 text-center animate-fade-up">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Saúde Financeira</p>
            <div className="flex items-center justify-center gap-3">
              <ScoreEmoji score={score} />
              <p className={`text-5xl md:text-6xl font-black ${scoreColor}`}>{score}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">de 100 pontos</p>
            <Progress value={score} className="mt-4 h-3 rounded-full" />
            <div className={`h-3 rounded-full ${scoreBg} -mt-3`} style={{ width: `${score}%` }} />
          </div>

          <div className="space-y-3 md:flex md:flex-col md:justify-center">
            {alerts.map((alert, i) => (
              <div key={i} className={`rounded-xl p-4 border flex items-start gap-3 animate-fade-up ${alert.type === "danger" ? "bg-danger/5 border-danger/20" : alert.type === "warning" ? "bg-warning/5 border-warning/20" : "bg-safe/5 border-safe/20"}`} style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                {alert.type === "safe" ? <Shield className="w-5 h-5 text-safe shrink-0 mt-0.5" /> : <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.type === "warning" ? "text-warning" : "text-danger"}`} />}
                <p className="text-sm font-medium text-foreground leading-relaxed">{alert.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Projection */}
        <InvestmentProjection
          investmentMonthly={investmentMonthly}
          selectedInvestment={selectedInvestment}
          setSelectedInvestment={setSelectedInvestment}
          isPremium={isPremium}
          navigate={navigate}
        />

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 md:mt-6">
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Renda</p>
            <p className="text-lg font-bold text-foreground mt-1">R$ {data.renda.toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Gastos</p>
            <p className="text-lg font-bold text-foreground mt-1">R$ {data.gastos.toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Saldo</p>
            <p className={`text-lg font-bold mt-1 ${saldo >= 0 ? "text-safe" : "text-danger"}`}>R$ {saldo.toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Reserva</p>
            <p className="text-lg font-bold text-foreground mt-1">{data.temReserva ? `R$ ${data.valorReserva.toLocaleString("pt-BR")}` : "Nenhuma"}</p>
          </div>
        </div>

        {/* Update Renda / Gastos buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => { setShowUpdateRenda(true); setNewRenda(String(data.renda)); }} className="bg-card rounded-xl p-3 border shadow-sm flex items-center gap-2 hover:bg-muted/50 transition-colors">
            <RefreshCw className="w-4 h-4 text-brand-green" />
            <span className="text-xs font-semibold text-foreground">Atualizar Renda</span>
          </button>
          <button onClick={() => { setShowUpdateGastos(true); setNewGastos(String(data.gastos)); }} className="bg-card rounded-xl p-3 border shadow-sm flex items-center gap-2 hover:bg-muted/50 transition-colors">
            <RefreshCw className="w-4 h-4 text-warning" />
            <span className="text-xs font-semibold text-foreground">Atualizar Gastos</span>
          </button>
        </div>

        {/* Monthly Investment (was "Guardado") */}
        <div className="bg-card rounded-xl p-4 border shadow-sm mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-brand-green" />
            <p className="text-xs text-muted-foreground font-medium">Investimento de {monthName}</p>
          </div>
          <p className="text-lg font-bold text-brand-green">
            R$ {(monthlySaving?.valor_guardado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => { setSavingDialog("add"); setSavingValue(""); setSavingDesc(""); }} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Adicionar
            </button>
            <button onClick={() => { setSavingDialog("remove"); setSavingValue(""); setSavingDesc(""); }} className="text-xs text-destructive font-medium hover:underline flex items-center gap-1">
              <Minus className="w-3 h-3" /> Retirar
            </button>
          </div>
        </div>

        {/* PDF Download */}
        <button onClick={handleDownloadPDF} className="w-full bg-card rounded-xl p-3 border shadow-sm flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors mb-6">
          <FileDown className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Baixar Relatório PDF de {monthName}</span>
        </button>

        {/* Weekly Expenses & Caixinhas */}
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <WeeklyExpenses selectedMonth={selectedMonth} selectedYear={selectedYear} />
          <div className="mt-6 md:mt-0">
            <Caixinhas />
          </div>
        </div>

        {/* Premium CTA */}
        {!isPremium && (
          <button onClick={() => navigate("/planos")} className="w-full bg-card rounded-xl p-4 border shadow-sm flex items-center gap-3 hover:bg-muted/50 transition-colors mt-6">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">Simulação de 1, 5 e 10 anos</p>
              <p className="text-xs text-muted-foreground">Disponível no plano Premium</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
      </div>

      {/* Saving Dialog */}
      <Dialog open={savingDialog !== null} onOpenChange={() => setSavingDialog(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Movimentar Investimento</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSavingDialog("add")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${savingDialog === "add" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Adicionar
            </button>
            <button
              onClick={() => setSavingDialog("remove")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${savingDialog === "remove" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Retirar
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Valor</label>
              <Input placeholder="R$ 0,00" value={savingValue} onChange={(e) => setSavingValue(e.target.value)} inputMode="decimal" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSavingDialog(null)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSavingConfirm} className="flex-1">Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Renda Dialog */}
      <Dialog open={showUpdateRenda} onOpenChange={setShowUpdateRenda}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Atualizar Renda</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Nova renda mensal</label>
              <Input placeholder="R$ 0,00" value={newRenda} onChange={(e) => setNewRenda(e.target.value)} inputMode="decimal" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpdateRenda(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleUpdateRenda} className="flex-1">Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Gastos Dialog */}
      <Dialog open={showUpdateGastos} onOpenChange={setShowUpdateGastos}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Atualizar Gastos</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Novos gastos fixos</label>
              <Input placeholder="R$ 0,00" value={newGastos} onChange={(e) => setNewGastos(e.target.value)} inputMode="decimal" className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpdateGastos(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleUpdateGastos} className="flex-1">Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Dashboard;
