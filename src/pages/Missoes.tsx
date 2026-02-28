import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData, FinancialData } from "@/hooks/useFinancialData";
import { CheckCircle2, Circle, Target, Flame, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

interface Mission {
  id: string;
  title: string;
  description: string;
  category: "economia" | "reserva" | "divida";
}

function generateMissions(data: FinancialData): Mission[] {
  const missions: Mission[] = [];
  if (data.gastos > 0) {
    missions.push({ id: "reduzir-gasto", title: "Reduza um gasto desnecessário", description: `Tente cortar R$ ${Math.round(data.gastos * 0.05)} esta semana.`, category: "economia" });
  }
  missions.push({ id: "guardar-valor", title: "Guarde qualquer valor", description: data.renda > 0 ? `Mesmo que seja R$ ${Math.max(10, Math.round(data.renda * 0.02))}.` : "Mesmo R$ 5 já conta.", category: "reserva" });
  if (data.temDividas) {
    missions.push({ id: "renegociar-divida", title: "Pesquise como renegociar uma dívida", description: "Serasa Limpa Nome pode reduzir até 90%.", category: "divida" });
  }
  missions.push({ id: "anotar-gastos", title: "Anote todos os gastos de hoje", description: "Veja pra onde o dinheiro vai.", category: "economia" });
  missions.push({ id: "comparar-precos", title: "Compare preços antes de comprar", description: "Pesquise em pelo menos 2 lugares.", category: "economia" });
  return missions;
}

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  economia: { bg: "bg-primary/10", text: "text-primary", label: "Economia" },
  reserva: { bg: "bg-safe/10", text: "text-safe", label: "Reserva" },
  divida: { bg: "bg-danger/10", text: "text-danger", label: "Dívida" },
};

const Missoes = () => {
  const { isPremium } = useAuth();
  const { data, saveData } = useFinancialData();
  const navigate = useNavigate();
  const missions = generateMissions(data);
  const completed = data.completedMissions || [];
  const progress = missions.length > 0 ? (completed.length / missions.length) * 100 : 0;

  if (!isPremium) {
    return (
      <AppLayout>
        <div className="px-5 py-6 pb-24 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-card rounded-2xl p-8 border shadow-sm text-center animate-fade-up">
            <Lock className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-foreground mb-2">Missões Semanais</h2>
            <p className="text-sm text-muted-foreground mb-6">Complete missões personalizadas para fortalecer sua segurança financeira. Disponível no plano Premium.</p>
            <Button onClick={() => navigate("/planos")} className="w-full h-12 rounded-xl font-bold" size="lg">Ver Planos</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const toggleMission = (id: string) => {
    const newCompleted = completed.includes(id) ? completed.filter((m) => m !== id) : [...completed, id];
    saveData({ completedMissions: newCompleted });
  };

  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Missões Semanais
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Complete missões para fortalecer sua segurança financeira</p>
        </div>

        <div className="bg-card rounded-2xl p-5 border shadow-sm mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold text-foreground">Progresso Semanal</span>
            </div>
            <span className="text-sm font-bold text-primary">{completed.length}/{missions.length}</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
          <div className="h-3 rounded-full bg-primary -mt-3" style={{ width: `${progress}%` }} />
          {progress === 100 && <p className="text-sm text-safe font-semibold mt-3 text-center">🎉 Parabéns! Todas as missões concluídas!</p>}
        </div>

        <div className="space-y-3">
          {missions.map((mission, i) => {
            const done = completed.includes(mission.id);
            const cat = categoryColors[mission.category];
            return (
              <button key={mission.id} onClick={() => toggleMission(mission.id)} className={`w-full text-left bg-card rounded-xl p-4 border shadow-sm transition-all animate-fade-up ${done ? "opacity-60" : "hover:shadow-md"}`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start gap-3">
                  {done ? <CheckCircle2 className="w-6 h-6 text-safe shrink-0 mt-0.5" /> : <Circle className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>{cat.label}</span>
                    </div>
                    <p className={`text-sm font-bold text-foreground ${done ? "line-through" : ""}`}>{mission.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mission.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Missoes;
