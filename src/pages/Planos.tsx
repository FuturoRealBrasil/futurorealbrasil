import { Check, Star, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";


const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "",
    description: "Para começar a organizar sua vida financeira",
    features: [
      "1 simulação de 6 meses",
      "Dados salvos na nuvem",
    ],
    cta: "Plano atual",
    highlight: false,
    planId: "free",
  },
  {
    name: "Premium",
    price: "R$ 19,90",
    period: "/mês",
    description: "Proteção completa para você e sua família",
    features: [
      "Simulação de 1, 5 e 10 anos",
      "Modo Emergência completo",
      "Missões personalizadas ilimitadas",
      "Educação financeira completa",
      "Histórico completo de progresso",
      "Sem limite de simulações",
    ],
    cta: "Assinar Premium",
    highlight: true,
    planId: "premium",
  },
];

const Planos = () => {
  const navigate = useNavigate();
  const { isPremium, user, refreshSubscription, subscriptionStart } = useAuth();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [searchParams] = useSearchParams();

  // Check for success/canceled redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("🎉 Plano Premium ativado com sucesso!");
      refreshSubscription();
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Assinatura cancelada. Você pode tentar novamente.");
    }
  }, [searchParams, refreshSubscription]);

  const getRemainingMonths = () => {
    if (!subscriptionStart) return 12;
    const start = new Date(subscriptionStart);
    const now = new Date();
    const monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    return Math.max(0, 12 - monthsPassed);
  };

  const canCancel = () => getRemainingMonths() === 0;

  const handleSubscribe = async () => {
    if (!user) return;
    setLoadingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error("Erro ao iniciar checkout: " + (e.message || "Tente novamente"));
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error("Erro ao abrir portal: " + (e.message || "Tente novamente"));
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-foreground">Planos</h1>
            <p className="text-sm text-muted-foreground mt-1">Invista no seu futuro financeiro</p>
          </div>
        </div>

        <div className="space-y-4">
          {plans.map((plan, i) => (
            <div key={i} className={`bg-card rounded-2xl p-6 border shadow-sm animate-fade-up ${plan.highlight ? "border-primary ring-2 ring-primary/20 relative" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>
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

              {plan.highlight && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    Este plano tem fidelidade de <strong>12 meses</strong> e poderá ser cancelado após esse período.
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="space-y-2.5 mb-5">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-safe shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              {plan.planId === "premium" ? (
                <div className="space-y-2">
                  {isPremium ? (
                    <>
                      <Button className="w-full h-12 rounded-xl font-bold" disabled>
                        ✅ Plano ativo
                      </Button>
                      {canCancel() ? (
                        <div className="space-y-2">
                          <Button
                            variant="destructive"
                            className="w-full h-10 rounded-xl text-sm"
                            onClick={handleManageSubscription}
                            disabled={loadingPortal}
                          >
                            {loadingPortal ? (
                              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Abrindo...</>
                            ) : (
                              "Cancelar Assinatura"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full h-10 rounded-xl text-sm border-primary text-primary"
                            onClick={handleManageSubscription}
                            disabled={loadingPortal}
                          >
                            🔄 Renovar por mais 12 meses
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-10 rounded-xl text-sm"
                          disabled
                        >
                          🔒 Cancelamento disponível em {getRemainingMonths()} {getRemainingMonths() === 1 ? "mês" : "meses"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                    <Button
                      className="w-full h-12 rounded-xl font-bold"
                      onClick={handleSubscribe}
                      disabled={loadingCheckout}
                    >
                      {loadingCheckout ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processando...</>
                      ) : (
                        plan.cta
                      )}
                    </Button>

                    {/* Trust Seal */}
                    <div className="mt-4 bg-safe/5 border border-safe/20 rounded-xl p-4 text-left space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🛡️</span>
                        <span className="text-sm font-bold text-foreground">Plataforma segura</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-safe shrink-0" /> Dados protegidos
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-safe shrink-0" /> Pagamento seguro
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-safe shrink-0" /> Tecnologia de análise financeira
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-safe shrink-0" /> Conforme normas da LGPD
                      </p>
                    </div>
                    </>
                  )}
                </div>
              ) : (
                <Button
                  className="w-full h-12 rounded-xl font-bold bg-muted text-muted-foreground hover:bg-muted"
                  disabled
                >
                  {isPremium ? "—" : plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground">🔒 Não vendemos seus dados</p>
          <p className="text-xs text-muted-foreground">🚫 Sem anúncios bancários</p>
          <p className="text-xs text-muted-foreground">✅ Transparência total</p>
          <button
            onClick={() => navigate("/#depoimentos")}
            className="text-xs text-brand-gold font-semibold hover:underline mt-2 inline-block"
          >
            Ver todos os 52 depoimentos →
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Planos;
