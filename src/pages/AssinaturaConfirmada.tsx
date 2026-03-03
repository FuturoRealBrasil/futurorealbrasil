import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AssinaturaConfirmada = () => {
  const { refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-up">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">Plano Premium Ativado! 🎉</h1>
          <p className="text-muted-foreground">
            Parabéns! Agora você tem acesso completo a todas as funcionalidades do Futuro Real Brasil.
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-5 text-left space-y-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> O que você desbloqueou:
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

        <div className="space-y-3 pt-2">
          <Button className="w-full h-12 rounded-xl font-bold" onClick={() => navigate("/dashboard")}>
            Ir para o Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" className="w-full h-10 rounded-xl" onClick={() => navigate("/planos")}>
            Ver meu plano
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssinaturaConfirmada;
