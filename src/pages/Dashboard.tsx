import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFinancialData, calcularFuturo } from "@/hooks/useFinancialData";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, AlertTriangle, Shield, ChevronRight, LogOut } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, loading } = useFinancialData();
  const { signOut } = useAuth();

  useEffect(() => {
    if (!loading && !data.onboardingDone) {
      navigate("/cadastro");
    }
  }, [loading, data.onboardingDone, navigate]);

  if (loading || !data.onboardingDone) return null;

  const { saldo, diasSemDinheiro, score } = calcularFuturo(data);
  const scoreColor = score >= 60 ? "text-safe" : score >= 30 ? "text-warning" : "text-danger";
  const scoreBg = score >= 60 ? "bg-safe" : score >= 30 ? "bg-warning" : "bg-danger";

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
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Seu Futuro</h1>
            <p className="text-sm text-muted-foreground">Simulação dos próximos 6 meses</p>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground p-2">
            <LogOut className="w-5 h-5" />
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

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Renda", value: `R$ ${data.renda.toLocaleString("pt-BR")}` },
            { label: "Gastos", value: `R$ ${data.gastos.toLocaleString("pt-BR")}` },
            { label: "Saldo", value: `R$ ${saldo.toLocaleString("pt-BR")}` },
            { label: "Reserva", value: data.temReserva ? `R$ ${data.valorReserva.toLocaleString("pt-BR")}` : "Nenhuma" },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              <p className="text-lg font-bold text-foreground mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Premium CTA */}
        <button onClick={() => navigate("/planos")} className="w-full bg-card rounded-xl p-4 border shadow-sm flex items-center gap-3 hover:bg-muted/50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-foreground">Simulação de 1 e 5 anos</p>
            <p className="text-xs text-muted-foreground">Disponível no plano Premium</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
