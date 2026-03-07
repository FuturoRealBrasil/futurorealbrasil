import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData, FinancialData } from "@/hooks/useFinancialData";
import { CheckCircle2, Circle, Target, Flame, Lock, ArrowLeft, Trophy, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

interface Mission {
  id: string;
  title: string;
  description: string;
  category: "economia" | "reserva" | "divida" | "habito";
  points: number;
  level: "iniciante" | "organizado" | "investidor" | "independente";
}

const allMissions: Mission[] = [
  // Iniciante
  { id: "anotar-gastos", title: "Anote todos os gastos de hoje", description: "Veja pra onde o dinheiro vai.", category: "economia", points: 10, level: "iniciante" },
  { id: "guardar-valor", title: "Guarde qualquer valor", description: "Mesmo R$ 5 já conta.", category: "reserva", points: 10, level: "iniciante" },
  { id: "listar-dividas", title: "Liste todas as suas dívidas", description: "Saber quanto deve é o primeiro passo.", category: "divida", points: 10, level: "iniciante" },
  { id: "cortar-gasto", title: "Corte um gasto desnecessário", description: "Cancele algo que não usa mais.", category: "economia", points: 15, level: "iniciante" },
  { id: "meta-semana", title: "Defina uma meta para a semana", description: "Quanto quer economizar?", category: "habito", points: 10, level: "iniciante" },
  // Organizado
  { id: "comparar-precos", title: "Compare preços antes de comprar", description: "Pesquise em pelo menos 2 lugares.", category: "economia", points: 15, level: "organizado" },
  { id: "cozinhar-casa", title: "Cozinhe todas as refeições hoje", description: "Economize evitando delivery.", category: "economia", points: 15, level: "organizado" },
  { id: "reserva-50", title: "Guarde R$ 50 este mês", description: "Construa sua reserva de emergência.", category: "reserva", points: 20, level: "organizado" },
  { id: "renegociar-divida", title: "Renegocie uma dívida", description: "Serasa Limpa Nome pode reduzir até 90%.", category: "divida", points: 25, level: "organizado" },
  { id: "planejar-compras", title: "Planeje suas compras da semana", description: "Faça lista antes de ir ao mercado.", category: "habito", points: 15, level: "organizado" },
  { id: "sem-delivery", title: "Fique 7 dias sem pedir delivery", description: "Cozinhe e economize.", category: "economia", points: 20, level: "organizado" },
  // Investidor
  { id: "abrir-corretora", title: "Abra conta em uma corretora", description: "Nu Invest, Rico ou XP são gratuitas.", category: "reserva", points: 25, level: "investidor" },
  { id: "primeiro-investimento", title: "Faça seu primeiro investimento", description: "CDB com liquidez diária a partir de R$ 1.", category: "reserva", points: 30, level: "investidor" },
  { id: "tesouro-direto", title: "Pesquise sobre Tesouro Direto", description: "O investimento mais seguro do Brasil.", category: "habito", points: 20, level: "investidor" },
  { id: "reserva-3meses", title: "Monte reserva de 3 meses", description: "Acumule 3 meses de gastos essenciais.", category: "reserva", points: 50, level: "investidor" },
  { id: "diversificar", title: "Diversifique seus investimentos", description: "Não coloque tudo no mesmo lugar.", category: "reserva", points: 30, level: "investidor" },
  // Independente
  { id: "reserva-6meses", title: "Monte reserva de 6 meses", description: "Meta ideal de reserva de emergência.", category: "reserva", points: 75, level: "independente" },
  { id: "renda-extra", title: "Crie uma fonte de renda extra", description: "Freelance, venda algo, ensine algo.", category: "economia", points: 50, level: "independente" },
  { id: "planejamento-anual", title: "Faça um planejamento anual", description: "Defina metas para os próximos 12 meses.", category: "habito", points: 40, level: "independente" },
  { id: "ensinar-alguem", title: "Ensine alguém sobre finanças", description: "Compartilhe o que aprendeu.", category: "habito", points: 30, level: "independente" },
  { id: "zero-dividas", title: "Quite todas as dívidas", description: "Liberdade financeira começa aqui.", category: "divida", points: 100, level: "independente" },
];

const levelInfo = {
  iniciante: { label: "🌱 Iniciante", color: "bg-brand-blue/10 text-brand-blue", desc: "Você está dando os primeiros passos. Foque em anotar gastos e entender sua situação." },
  organizado: { label: "📋 Organizado", color: "bg-brand-green/10 text-brand-green", desc: "Você já sabe para onde vai o dinheiro. Agora é hora de planejar e cortar desperdícios." },
  investidor: { label: "📈 Investidor", color: "bg-brand-gold/10 text-brand-gold", desc: "Você está pronto para fazer o dinheiro trabalhar por você. Hora de investir!" },
  independente: { label: "🏆 Independente", color: "bg-accent/10 text-accent", desc: "Você tem controle total. Sua meta agora é liberdade financeira completa." },
};

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  economia: { bg: "bg-primary/10", text: "text-primary", label: "Economia" },
  reserva: { bg: "bg-safe/10", text: "text-safe", label: "Reserva" },
  divida: { bg: "bg-danger/10", text: "text-danger", label: "Dívida" },
  habito: { bg: "bg-brand-gold/10", text: "text-brand-gold", label: "Hábito" },
};

const Missoes = () => {
  const { isPremium } = useAuth();
  const { data, saveData } = useFinancialData();
  const navigate = useNavigate();
  const completed = data.completedMissions || [];

  const totalPoints = allMissions.filter(m => completed.includes(m.id)).reduce((sum, m) => sum + m.points, 0);

  // Weekly missions: pick 4 based on current week
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const weeklyMissions = allMissions.filter((_, i) => i % 5 === weekNum % 5 || i === weekNum % allMissions.length).slice(0, 4);
  const weeklyCompleted = weeklyMissions.filter(m => completed.includes(m.id)).length;

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
    const mission = allMissions.find(m => m.id === id);
    const newCompleted = completed.includes(id) ? completed.filter((m) => m !== id) : [...completed, id];
    saveData({ completedMissions: newCompleted });
    if (!completed.includes(id) && mission) {
      toast.success(`+${mission.points} pontos! 🎉`);
    }
  };

  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Missões
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Complete missões para fortalecer sua segurança financeira</p>
        </div>

        {/* Points */}
        <div className="bg-card rounded-2xl p-4 border shadow-sm mb-4 flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand-gold" />
            <span className="text-sm font-bold text-foreground">Seus pontos</span>
          </div>
          <span className="text-xl font-black text-brand-gold">{totalPoints}</span>
        </div>

        {/* Weekly progress */}
        <div className="bg-card rounded-2xl p-5 border shadow-sm mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              <span className="text-sm font-bold text-foreground">Missão da semana</span>
            </div>
            <span className="text-sm font-bold text-primary">{weeklyCompleted}/{weeklyMissions.length}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Progresso {weeklyCompleted} de {weeklyMissions.length} tarefas</p>
          <Progress value={(weeklyCompleted / weeklyMissions.length) * 100} className="h-3 rounded-full" />
          <div className="h-3 rounded-full bg-primary -mt-3" style={{ width: `${(weeklyCompleted / weeklyMissions.length) * 100}%` }} />
          {weeklyCompleted === weeklyMissions.length && <p className="text-sm text-safe font-semibold mt-3 text-center">🎉 Parabéns! Todas as missões da semana concluídas!</p>}
        </div>

        {/* Missions by level */}
        {(["iniciante", "organizado", "investidor", "independente"] as const).map((level) => {
          const lvl = levelInfo[level];
          const missions = allMissions.filter(m => m.level === level);
          const lvlCompleted = missions.filter(m => completed.includes(m.id)).length;

          return (
            <div key={level} className="mb-6">
              <div className={`rounded-xl p-3 mb-3 ${lvl.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{lvl.label}</span>
                  <span className="text-xs font-medium">{lvlCompleted}/{missions.length}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{lvl.desc}</p>
              </div>

              <div className="space-y-2">
                {missions.map((mission, i) => {
                  const done = completed.includes(mission.id);
                  const cat = categoryColors[mission.category];
                  return (
                    <button key={mission.id} onClick={() => toggleMission(mission.id)} className={`w-full text-left bg-card rounded-xl p-4 border shadow-sm transition-all ${done ? "opacity-60" : "hover:shadow-md"}`}>
                      <div className="flex items-start gap-3">
                        {done ? <CheckCircle2 className="w-5 h-5 text-safe shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>{cat.label}</span>
                            <span className="text-[10px] font-bold text-brand-gold flex items-center gap-0.5"><Star className="w-3 h-3" />{mission.points}pts</span>
                          </div>
                          <p className={`text-sm font-bold text-foreground ${done ? "line-through" : ""}`}>{mission.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{mission.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Missoes;
