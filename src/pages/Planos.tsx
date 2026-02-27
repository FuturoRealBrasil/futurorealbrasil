import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "",
    description: "Para começar a organizar sua vida financeira",
    features: [
      "Simulação de 6 meses",
      "3 missões semanais",
      "Conteúdos básicos de educação financeira",
      "Dados salvos no seu celular",
    ],
    cta: "Plano atual",
    active: true,
    highlight: false,
  },
  {
    name: "Premium",
    price: "R$ 9,90",
    period: "/mês",
    description: "Proteção completa para você e sua família",
    features: [
      "Simulação de 1 e 5 anos",
      "Modo Emergência completo",
      "Missões personalizadas ilimitadas",
      "Histórico completo de progresso",
      "Conteúdos exclusivos",
      "Sem limite de simulações",
    ],
    cta: "Em breve",
    active: false,
    highlight: true,
  },
];

const Planos = () => {
  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-foreground">Planos</h1>
          <p className="text-sm text-muted-foreground mt-1">Invista no seu futuro financeiro</p>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`bg-card rounded-2xl p-6 border shadow-sm animate-fade-up ${
                plan.highlight ? "border-primary ring-2 ring-primary/20 relative" : ""
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Recomendado
                </div>
              )}
              <h2 className="text-lg font-extrabold text-foreground">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="text-3xl font-black text-foreground">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="space-y-2.5 mb-5">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-safe shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full h-12 rounded-xl font-bold ${
                  plan.highlight ? "" : "bg-muted text-muted-foreground hover:bg-muted"
                }`}
                disabled={!plan.highlight}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Ethics */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground">🔒 Não vendemos seus dados</p>
          <p className="text-xs text-muted-foreground">🚫 Sem anúncios bancários</p>
          <p className="text-xs text-muted-foreground">✅ Transparência total</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Planos;
