import { useState } from "react";
import { AlertTriangle, Zap, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const scenarios = [
  {
    id: "desemprego",
    icon: "💼",
    title: "Desemprego",
    checklist: [
      "Solicite seguro-desemprego imediatamente",
      "Corte todos os gastos não essenciais",
      "Renegocie aluguel e dívidas",
      "Cadastre-se no SINE e sites de emprego",
      "Considere trabalhos temporários ou freelance",
      "Atualize seu CadÚnico para benefícios",
    ],
    cortes: ["Streaming e assinaturas", "Delivery e alimentação fora", "Compras parceladas não essenciais"],
    prioridades: ["1. Alimentação", "2. Moradia", "3. Saúde", "4. Transporte para buscar emprego"],
  },
  {
    id: "doenca",
    icon: "🏥",
    title: "Doença na família",
    checklist: [
      "Verifique cobertura do SUS para seu caso",
      "Solicite auxílio-doença se for CLT",
      "Peça ajuda na UBS mais próxima",
      "Busque medicamentos genéricos ou pelo Farmácia Popular",
      "Fale com assistente social do hospital",
    ],
    cortes: ["Gastos variáveis não urgentes", "Lazer temporariamente"],
    prioridades: ["1. Tratamento médico", "2. Alimentação adequada", "3. Moradia", "4. Medicamentos"],
  },
  {
    id: "enchente",
    icon: "🌊",
    title: "Enchente / Desastre",
    checklist: [
      "Procure abrigo seguro (Defesa Civil: 199)",
      "Documente danos com fotos e vídeos",
      "Solicite saque do FGTS por calamidade",
      "Cadastre-se na Defesa Civil para auxílio",
      "Busque doações em pontos de coleta oficiais",
    ],
    cortes: ["Foque apenas no essencial até estabilizar"],
    prioridades: ["1. Segurança física", "2. Documentos", "3. Alimentação e água", "4. Moradia temporária"],
  },
  {
    id: "crise-precos",
    icon: "📈",
    title: "Crise de preços / Inflação",
    checklist: [
      "Substitua marcas caras por genéricas",
      "Compre no atacado o que puder",
      "Planeje refeições da semana antes de comprar",
      "Reduza uso de carro — priorize transporte público",
      "Busque promoções e compare preços online",
    ],
    cortes: ["Marcas premium", "Refeições fora de casa", "Compras por impulso"],
    prioridades: ["1. Alimentação básica", "2. Contas fixas", "3. Transporte", "4. Saúde"],
  },
];

const Emergencia = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPremium] = useState(false);
  const navigate = useNavigate();

  const scenario = scenarios.find((s) => s.id === selected);

  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-danger" />
            Modo Emergência
          </h1>
          <p className="text-sm text-muted-foreground mt-1">O que fazer quando a crise chegar</p>
        </div>

        {!isPremium && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-up">
            <Lock className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Recurso Premium</p>
              <p className="text-xs text-muted-foreground">Desbloqueie com o plano Premium</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => navigate("/planos")}>
              Ver planos
            </Button>
          </div>
        )}

        {/* Scenarios */}
        {!selected ? (
          <div className="space-y-3">
            {scenarios.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className="w-full text-left bg-card rounded-xl p-4 border shadow-sm hover:shadow-md transition-all flex items-center gap-4 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="text-3xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="text-base font-bold text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.checklist.length} ações recomendadas</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : scenario ? (
          <div className="animate-fade-up">
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-primary font-semibold mb-4 flex items-center gap-1"
            >
              ← Voltar
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{scenario.icon}</span>
              <h2 className="text-xl font-extrabold text-foreground">{scenario.title}</h2>
            </div>

            {/* Checklist */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" /> Checklist Imediato
              </h3>
              <div className="space-y-2">
                {scenario.checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-card rounded-lg p-3 border">
                    <span className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cortes */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground mb-3">✂️ Cortes Urgentes</h3>
              <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 space-y-2">
                {scenario.cortes.map((c, i) => (
                  <p key={i} className="text-sm text-foreground flex items-center gap-2">
                    <span className="text-danger">✕</span> {c}
                  </p>
                ))}
              </div>
            </div>

            {/* Prioridades */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">🎯 Prioridades Financeiras</h3>
              <div className="bg-safe/5 border border-safe/20 rounded-xl p-4 space-y-2">
                {scenario.prioridades.map((p, i) => (
                  <p key={i} className="text-sm font-medium text-foreground">{p}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default Emergencia;
