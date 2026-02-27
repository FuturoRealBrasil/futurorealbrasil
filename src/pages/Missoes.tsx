import { useState, useEffect } from "react";
import { getUserData, saveUserData, UserData } from "@/lib/storage";
import { CheckCircle2, Circle, Target, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";

interface Mission {
  id: string;
  title: string;
  description: string;
  category: "economia" | "reserva" | "divida";
}

function generateMissions(data: UserData): Mission[] {
  const missions: Mission[] = [];

  if (data.gastos > 0) {
    missions.push({
      id: "reduzir-gasto",
      title: "Reduza um gasto desnecessário",
      description: `Tente cortar R$ ${Math.round(data.gastos * 0.05)} esta semana em algo que pode esperar.`,
      category: "economia",
    });
  }

  missions.push({
    id: "guardar-valor",
    title: "Guarde qualquer valor",
    description: data.renda > 0
      ? `Mesmo que seja R$ ${Math.max(10, Math.round(data.renda * 0.02))}, o hábito é o que importa.`
      : "Mesmo R$ 5 já conta. O hábito é o que importa.",
    category: "reserva",
  });

  if (data.temDividas) {
    missions.push({
      id: "renegociar-divida",
      title: "Pesquise como renegociar uma dívida",
      description: "Ligue para o credor ou acesse o Serasa Limpa Nome. Renegociar pode reduzir até 90%.",
      category: "divida",
    });
  }

  missions.push({
    id: "anotar-gastos",
    title: "Anote todos os gastos de hoje",
    description: "Pode ser no papel, no celular — o importante é ver pra onde o dinheiro vai.",
    category: "economia",
  });

  missions.push({
    id: "comparar-precos",
    title: "Compare preços antes de comprar",
    description: "Antes da próxima compra, pesquise em pelo menos 2 lugares diferentes.",
    category: "economia",
  });

  return missions;
}

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  economia: { bg: "bg-primary/10", text: "text-primary", label: "Economia" },
  reserva: { bg: "bg-safe/10", text: "text-safe", label: "Reserva" },
  divida: { bg: "bg-danger/10", text: "text-danger", label: "Dívida" },
};

const Missoes = () => {
  const [data, setData] = useState<UserData>(getUserData());
  const missions = generateMissions(data);
  const completed = data.completedMissions || [];
  const progress = missions.length > 0 ? (completed.length / missions.length) * 100 : 0;

  const toggleMission = (id: string) => {
    const newCompleted = completed.includes(id)
      ? completed.filter((m) => m !== id)
      : [...completed, id];
    const updated = saveUserData({ completedMissions: newCompleted });
    setData(updated);
  };

  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Missões Semanais
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Complete missões para fortalecer sua segurança financeira</p>
        </div>

        {/* Progress */}
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
          {progress === 100 && (
            <p className="text-sm text-safe font-semibold mt-3 text-center">
              🎉 Parabéns! Todas as missões concluídas!
            </p>
          )}
        </div>

        {/* Missions */}
        <div className="space-y-3">
          {missions.map((mission, i) => {
            const done = completed.includes(mission.id);
            const cat = categoryColors[mission.category];
            return (
              <button
                key={mission.id}
                onClick={() => toggleMission(mission.id)}
                className={`w-full text-left bg-card rounded-xl p-4 border shadow-sm transition-all animate-fade-up ${
                  done ? "opacity-60" : "hover:shadow-md"
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  {done ? (
                    <CheckCircle2 className="w-6 h-6 text-safe shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                        {cat.label}
                      </span>
                    </div>
                    <p className={`text-sm font-bold text-foreground ${done ? "line-through" : ""}`}>
                      {mission.title}
                    </p>
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
