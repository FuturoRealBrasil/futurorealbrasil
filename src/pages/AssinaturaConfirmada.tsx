import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Sparkles, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const AssinaturaConfirmada = () => {
  const { refreshSubscription } = useAuth();
  const navigate = useNavigate();

  const fireConfetti = useCallback(() => {
    // First burst - left side
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.15, y: 0.6 },
      colors: ["#1a5632", "#d4a017", "#1e3a5f", "#ffffff"],
    });
    // First burst - right side
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.85, y: 0.6 },
      colors: ["#1a5632", "#d4a017", "#1e3a5f", "#ffffff"],
    });

    // Second wave after delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ["#1a5632", "#d4a017", "#1e3a5f"],
      });
    }, 300);

    // Stars effect
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 120,
        origin: { x: 0.5, y: 0.5 },
        shapes: ["star"],
        colors: ["#d4a017", "#f5c842"],
        scalar: 1.4,
      });
    }, 600);
  }, []);

  useEffect(() => {
    refreshSubscription();
    // Fire confetti on mount
    const timer = setTimeout(fireConfetti, 400);
    return () => clearTimeout(timer);
  }, [refreshSubscription, fireConfetti]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-brand-green/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="relative w-24 h-24 rounded-full bg-brand-green/10 flex items-center justify-center animate-fade-up">
            <CheckCircle2 className="w-12 h-12 text-brand-green" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Crown className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-2xl font-extrabold text-foreground">Plano Premium Ativado! 🎉</h1>
          <p className="text-muted-foreground">
            Parabéns! Agora você tem acesso completo a todas as funcionalidades do Futuro Real Brasil.
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-5 text-left space-y-3 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-gold" /> O que você desbloqueou:
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ Simulação de 1, 5 e 10 anos</li>
            <li>✅ Modo Emergência completo</li>
            <li>✅ Missões personalizadas ilimitadas</li>
            <li>✅ Educação financeira completa</li>
            <li>✅ Histórico completo de progresso</li>
            <li>✅ Sem limite de simulações</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2 animate-fade-up" style={{ animationDelay: "0.6s" }}>
          <Button className="w-full h-12 rounded-xl font-bold bg-brand-green hover:bg-brand-green/90" onClick={() => navigate("/dashboard")}>
            Ir para o Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" className="w-full h-10 rounded-xl" onClick={() => navigate("/planos")}>
            Ver meu plano
          </Button>
          <button onClick={fireConfetti} className="text-xs text-muted-foreground hover:text-brand-gold transition-colors">
            🎊 Celebrar novamente!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssinaturaConfirmada;
