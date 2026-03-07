import { Check, Star, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import Testimonials from "@/components/Testimonials";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HamburgerMenu from "@/components/HamburgerMenu";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "",
    description: "Para começar a organizar sua vida financeira",
    features: ["1 simulação de 6 meses", "Dados salvos na nuvem"],
    cta: "Plano atual",
    highlight: false,
    planId: "free",
    isAnnual: false,
  },
  {
    name: "Premium Mensal",
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
    cta: "Assinar R$19,90/Por Mês",
    highlight: true,
    planId: "premium",
    isAnnual: false,
  },
  {
    name: "Premium Anual",
    price: "R$ 219,90",
    period: "/ano",
    originalPrice: "R$ 238,80",
    description: "Economize com o plano anual",
    features: [
      "Tudo do plano mensal",
      "Economia de R$ 18,90 por ano",
      "R$ 0,59 por dia",
      "Suporte prioritário",
    ],
    cta: "Assinar R$219,90/Ao Ano",
    highlight: false,
    planId: "premium_annual",
    isAnnual: true,
  },
];

const Planos = () => {
  const navigate = useNavigate();
  const { isPremium, user, refreshSubscription, subscriptionStart } = useAuth();
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [searchParams] = useSearchParams();

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

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    setLoadingCheckout(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error("Erro ao iniciar checkout: " + (e.message || "Tente novamente"));
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error("Erro ao abrir portal: " + (e.message || "Tente novamente"));
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <AppLayout hideMenu>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <HamburgerMenu />
          </div>
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
                {plan.isAnnual && plan.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through mr-2">{plan.originalPrice}</span>
                )}
                <span className="text-3xl font-black text-foreground">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </div>

              {plan.highlight && (
                <div className="flex items-start gap-2 bg-brand-green/10 border border-brand-green/20 rounded-lg p-3 mb-4">
                  <Star className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-green leading-relaxed font-semibold">
                    Plano anual com desconto especial
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

              {plan.planId === "premium" || plan.planId === "premium_annual" ? (
                <div className="space-y-2">
                  {isPremium ? (
                    <>
                      <Button className="w-full h-12 rounded-xl font-bold" disabled>✅ Plano ativo</Button>
                      <Button
                        variant="outline"
                        className={`w-full h-10 rounded-xl text-sm font-semibold ${plan.isAnnual ? 'border-brand-gold text-brand-gold' : 'border-primary text-primary'}`}
                        onClick={() => handleSubscribe(plan.planId)}
                        disabled={loadingCheckout !== null}
                      >
                        {loadingCheckout === plan.planId ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processando...</> : `Migrar para ${plan.name}`}
                      </Button>
                      {canCancel() ? (
                        <div className="space-y-2">
                          <Button variant="destructive" className="w-full h-10 rounded-xl text-sm" onClick={handleManageSubscription} disabled={loadingPortal}>
                            {loadingPortal ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Abrindo...</> : "Cancelar Assinatura"}
                          </Button>
                          <Button variant="outline" className="w-full h-10 rounded-xl text-sm border-primary text-primary" onClick={handleManageSubscription} disabled={loadingPortal}>
                            🔄 Renovar por mais 12 meses
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" className="w-full h-10 rounded-xl text-sm" disabled>
                          🔒 Cancelamento disponível em {getRemainingMonths()} {getRemainingMonths() === 1 ? "mês" : "meses"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button className={`w-full h-12 rounded-xl font-bold ${plan.isAnnual ? 'bg-brand-gold hover:bg-brand-gold/90' : ''}`} onClick={() => handleSubscribe(plan.planId)} disabled={loadingCheckout !== null}>
                        {loadingCheckout === plan.planId ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processando...</> : plan.cta}
                      </Button>
                      {plan.highlight && (
                        <div className="mt-4 bg-safe/5 border border-safe/20 rounded-xl p-4 text-left space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🛡️</span>
                            <span className="text-sm font-bold text-foreground">Plataforma segura</span>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-safe shrink-0" /> Dados protegidos</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-safe shrink-0" /> Pagamento seguro</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-safe shrink-0" /> Conforme normas da LGPD</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <Button className="w-full h-12 rounded-xl font-bold bg-muted text-muted-foreground hover:bg-muted" disabled>
                  {isPremium ? "—" : plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-8">
          <Testimonials />
        </div>

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
