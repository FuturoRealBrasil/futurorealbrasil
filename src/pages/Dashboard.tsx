import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinancialData, calcularFuturo } from "@/hooks/useFinancialData";
import { useMonthlySavings } from "@/hooks/useMonthlySavings";
import { useSavingsTransactions } from "@/hooks/useSavingsTransactions";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, AlertTriangle, Shield, ChevronRight, LogOut, ChevronLeft, Wallet, PiggyBank, RefreshCw, DollarSign, Minus, FileDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import WeeklyExpenses from "@/components/WeeklyExpenses";
import Caixinhas from "@/components/Caixinhas";
import { toast } from "sonner";
import { generateTransactionsPDF } from "@/lib/pdfGenerator";
import logo from "@/assets/logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, loading, saveData } = useFinancialData();
  const { signOut, isPremium } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { saving: monthlySaving, addSaving, addReserve, removeSaving, removeReserve } = useMonthlySavings(selectedMonth, selectedYear);
  const { transactions, load: loadTransactions, logTransaction } = useSavingsTransactions(selectedMonth, selectedYear);

  const [showSavingInput, setShowSavingInput] = useState(false);
  const [savingValue, setSavingValue] = useState("");
  const [savingDesc, setSavingDesc] = useState("");
  const [showReserveInput, setShowReserveInput] = useState(false);
  const [reserveValue, setReserveValue] = useState("");
  const [reserveDesc, setReserveDesc] = useState("");
  const [showRemoveSaving, setShowRemoveSaving] = useState(false);
  const [removeSavingValue, setRemoveSavingValue] = useState("");
  const [removeSavingDesc, setRemoveSavingDesc] = useState("");
  const [showRemoveReserve, setShowRemoveReserve] = useState(false);
  const [removeReserveValue, setRemoveReserveValue] = useState("");
  const [removeReserveDesc, setRemoveReserveDesc] = useState("");
  const [showUpdateRenda, setShowUpdateRenda] = useState(false);
  const [newRenda, setNewRenda] = useState("");
  const [showUpdateGastos, setShowUpdateGastos] = useState(false);
  const [newGastos, setNewGastos] = useState("");

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

  async function handleAddSaving() {
    const v = parseFloat(savingValue.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Valor inválido"); return; }
    await addSaving(v);
    await logTransaction("guardado_add", v, savingDesc || "Valor guardado", selectedMonth, selectedYear);
    setSavingValue(""); setSavingDesc(""); setShowSavingInput(false);
    toast.success("Valor guardado!");
  }

  async function handleAddReserve() {
    const v = parseFloat(reserveValue.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Valor inválido"); return; }
    await addReserve(v);
    await saveData({ temReserva: true, valorReserva: data.valorReserva + v });
    await logTransaction("reserva_add", v, reserveDesc || "Reserva adicionada", selectedMonth, selectedYear);
    setReserveValue(""); setReserveDesc(""); setShowReserveInput(false);
    toast.success("Reserva atualizada!");
  }

  async function handleRemoveSaving() {
    const v = parseFloat(removeSavingValue.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Valor inválido"); return; }
    await removeSaving(v);
    await logTransaction("guardado_remove", v, removeSavingDesc || "Valor retirado", selectedMonth, selectedYear);
    setRemoveSavingValue(""); setRemoveSavingDesc(""); setShowRemoveSaving(false);
    toast.success("Valor retirado!");
  }

  async function handleRemoveReserve() {
    const v = parseFloat(removeReserveValue.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Valor inválido"); return; }
    await removeReserve(v);
    await saveData({ valorReserva: Math.max(0, data.valorReserva - v) });
    await logTransaction("reserva_remove", v, removeReserveDesc || "Reserva retirada", selectedMonth, selectedYear);
    setRemoveReserveValue(""); setRemoveReserveDesc(""); setShowRemoveReserve(false);
    toast.success("Reserva reduzida!");
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

  // Savings projection
  const monthlySavingsAmount = saldo > 0 ? saldo : 0;
  const projection6m = monthlySavingsAmount * 6;
  const projection1y = monthlySavingsAmount * 12;
  const projection5y = monthlySavingsAmount * 60;
  const projection10y = monthlySavingsAmount * 120;

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
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="Logo" className="w-19 h-19 object-contain mix-blend-multiply shrink-0" />
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-foreground leading-tight">Seu Futuro</h1>
              <p className="text-sm text-muted-foreground">Simulação financeira</p>
            </div>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

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

        {/* Score */}
        <div className="bg-card rounded-2xl p-6 border shadow-sm mb-6 text-center animate-fade-up">
          <p className="text-sm font-semibold text-muted-foreground mb-2">Saúde Financeira</p>
          <p className={`text-5xl font-black ${scoreColor}`}>{score}</p>
          <p className="text-xs text-muted-foreground mt-1">de 100 pontos</p>
          <Progress value={score} className="mt-4 h-3 rounded-full" />
          <div className={`h-3 rounded-full ${scoreBg} -mt-3`} style={{ width: `${score}%` }} />
        </div>

        {/* Alerts */}
        <div className="space-y-3 mb-6">
          {alerts.map((alert, i) => (
            <div key={i} className={`rounded-xl p-4 border flex items-start gap-3 animate-fade-up ${alert.type === "danger" ? "bg-danger/5 border-danger/20" : alert.type === "warning" ? "bg-warning/5 border-warning/20" : "bg-safe/5 border-safe/20"}`} style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
              {alert.type === "safe" ? <Shield className="w-5 h-5 text-safe shrink-0 mt-0.5" /> : <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.type === "warning" ? "text-warning" : "text-danger"}`} />}
              <p className="text-sm font-medium text-foreground leading-relaxed">{alert.text}</p>
            </div>
          ))}
        </div>

        {/* Savings Projection */}
        <div className="bg-card rounded-2xl p-5 border shadow-sm mb-6 animate-fade-up">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-green" /> Projeção de Economia
          </h2>
          {saldo > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Se você guardar <span className="font-bold text-foreground">R$ {monthlySavingsAmount.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}/mês</span>:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-safe/5 rounded-lg p-3 border border-safe/20">
                  <p className="text-xs text-muted-foreground">Em 6 meses</p>
                  <p className="text-sm font-bold text-safe">R$ {projection6m.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                </div>
                {isPremium ? (
                  <>
                    <div className="bg-safe/5 rounded-lg p-3 border border-safe/20">
                      <p className="text-xs text-muted-foreground">Em 1 ano</p>
                      <p className="text-sm font-bold text-safe">R$ {projection1y.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-safe/5 rounded-lg p-3 border border-safe/20">
                      <p className="text-xs text-muted-foreground">Em 5 anos</p>
                      <p className="text-sm font-bold text-safe">R$ {projection5y.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                      <p className="text-xs text-muted-foreground">Em 10 anos</p>
                      <p className="text-sm font-bold text-primary">R$ {projection10y.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                    </div>
                  </>
                ) : (
                  <button onClick={() => navigate("/planos")} className="bg-primary/5 rounded-lg p-3 border border-primary/20 text-left hover:bg-primary/10 transition-colors">
                    <p className="text-xs text-muted-foreground">1, 5 e 10 anos</p>
                    <p className="text-xs font-bold text-primary">🔒 Premium</p>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aumente sua renda ou reduza gastos para ver projeções de economia.</p>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
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
          {showUpdateRenda ? (
            <div className="bg-card rounded-xl p-3 border shadow-sm space-y-2">
              <Input placeholder="Nova renda" value={newRenda} onChange={(e) => setNewRenda(e.target.value)} inputMode="decimal" className="h-9 text-sm" />
              <div className="flex gap-1">
                <Button size="sm" onClick={handleUpdateRenda} className="flex-1 h-8 text-xs">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setShowUpdateRenda(false)} className="h-8 text-xs">X</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setShowUpdateRenda(true); setNewRenda(String(data.renda)); }} className="bg-card rounded-xl p-3 border shadow-sm flex items-center gap-2 hover:bg-muted/50 transition-colors">
              <RefreshCw className="w-4 h-4 text-brand-green" />
              <span className="text-xs font-semibold text-foreground">Atualizar Renda</span>
            </button>
          )}
          {showUpdateGastos ? (
            <div className="bg-card rounded-xl p-3 border shadow-sm space-y-2">
              <Input placeholder="Novos gastos" value={newGastos} onChange={(e) => setNewGastos(e.target.value)} inputMode="decimal" className="h-9 text-sm" />
              <div className="flex gap-1">
                <Button size="sm" onClick={handleUpdateGastos} className="flex-1 h-8 text-xs">Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setShowUpdateGastos(false)} className="h-8 text-xs">X</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setShowUpdateGastos(true); setNewGastos(String(data.gastos)); }} className="bg-card rounded-xl p-3 border shadow-sm flex items-center gap-2 hover:bg-muted/50 transition-colors">
              <RefreshCw className="w-4 h-4 text-warning" />
              <span className="text-xs font-semibold text-foreground">Atualizar Gastos</span>
            </button>
          )}
        </div>

        {/* Monthly Savings / Reserve */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-brand-green" />
              <p className="text-xs text-muted-foreground font-medium">Guardado em {monthName}</p>
            </div>
            <p className="text-lg font-bold text-brand-green">
              R$ {(monthlySaving?.valor_guardado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            {showSavingInput ? (
              <div className="mt-2 space-y-2">
                <Input placeholder="Valor (R$)" value={savingValue} onChange={(e) => setSavingValue(e.target.value)} inputMode="decimal" className="h-8 text-sm" />
                <Input placeholder="Descrição (opcional)" value={savingDesc} onChange={(e) => setSavingDesc(e.target.value)} className="h-8 text-sm" />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleAddSaving} className="flex-1 h-7 text-xs">Guardar</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowSavingInput(false)} className="h-7 text-xs">X</Button>
                </div>
              </div>
            ) : showRemoveSaving ? (
              <div className="mt-2 space-y-2">
                <Input placeholder="Valor (R$)" value={removeSavingValue} onChange={(e) => setRemoveSavingValue(e.target.value)} inputMode="decimal" className="h-8 text-sm" />
                <Input placeholder="Motivo da retirada" value={removeSavingDesc} onChange={(e) => setRemoveSavingDesc(e.target.value)} className="h-8 text-sm" />
                <div className="flex gap-1">
                  <Button size="sm" variant="destructive" onClick={handleRemoveSaving} className="flex-1 h-7 text-xs">Retirar</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowRemoveSaving(false)} className="h-7 text-xs">X</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-2">
                <button onClick={() => setShowSavingInput(true)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Adicionar
                </button>
                <button onClick={() => setShowRemoveSaving(true)} className="text-xs text-destructive font-medium hover:underline flex items-center gap-1">
                  <Minus className="w-3 h-3" /> Retirar
                </button>
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-4 h-4 text-brand-gold" />
              <p className="text-xs text-muted-foreground font-medium">Reserva em {monthName}</p>
            </div>
            <p className="text-lg font-bold text-brand-gold">
              R$ {(monthlySaving?.valor_reserva || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            {showReserveInput ? (
              <div className="mt-2 space-y-2">
                <Input placeholder="Valor (R$)" value={reserveValue} onChange={(e) => setReserveValue(e.target.value)} inputMode="decimal" className="h-8 text-sm" />
                <Input placeholder="Descrição (opcional)" value={reserveDesc} onChange={(e) => setReserveDesc(e.target.value)} className="h-8 text-sm" />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleAddReserve} className="flex-1 h-7 text-xs">Adicionar</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowReserveInput(false)} className="h-7 text-xs">X</Button>
                </div>
              </div>
            ) : showRemoveReserve ? (
              <div className="mt-2 space-y-2">
                <Input placeholder="Valor (R$)" value={removeReserveValue} onChange={(e) => setRemoveReserveValue(e.target.value)} inputMode="decimal" className="h-8 text-sm" />
                <Input placeholder="Motivo da retirada" value={removeReserveDesc} onChange={(e) => setRemoveReserveDesc(e.target.value)} className="h-8 text-sm" />
                <div className="flex gap-1">
                  <Button size="sm" variant="destructive" onClick={handleRemoveReserve} className="flex-1 h-7 text-xs">Retirar</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowRemoveReserve(false)} className="h-7 text-xs">X</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-2">
                <button onClick={() => setShowReserveInput(true)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Adicionar
                </button>
                <button onClick={() => setShowRemoveReserve(true)} className="text-xs text-destructive font-medium hover:underline flex items-center gap-1">
                  <Minus className="w-3 h-3" /> Retirar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PDF Download */}
        <button onClick={handleDownloadPDF} className="w-full bg-card rounded-xl p-3 border shadow-sm flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors mb-6">
          <FileDown className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Baixar Relatório PDF de {monthName}</span>
        </button>

        {/* Weekly Expenses */}
        <WeeklyExpenses selectedMonth={selectedMonth} selectedYear={selectedYear} />

        {/* Caixinhas */}
        <div className="mt-6">
          <Caixinhas />
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
    </AppLayout>
  );
};

export default Dashboard;
