import { useNavigate } from "react-router-dom";
import { TrendingUp, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    navigate(user ? "/dashboard" : "/auth");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-8 animate-fade-up">
          <img src={logo} alt="Futuro Real Brasil" className="w-56 mx-auto mb-6" />
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
            Antes que a vida te pegue de surpresa,{" "}
            <span className="text-primary font-bold">veja o futuro.</span>
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3 mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {[
            { icon: TrendingUp, text: "Preveja riscos antes que aconteçam" },
            { icon: Heart, text: "Proteja quem depende de você" },
            { icon: Shield, text: "Sem julgamento. Só soluções." },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-card rounded-lg p-3 shadow-sm border">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm space-y-3 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <Button onClick={handleStart} className="w-full h-14 text-base font-bold rounded-xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground" size="lg">
            {user ? "Ir para o Dashboard" : "Começar agora"}
          </Button>
          {!user && (
            <Button onClick={() => navigate("/auth")} variant="outline" className="w-full h-12 text-base font-semibold rounded-xl border-primary text-primary hover:bg-primary/5">
              Entrar
            </Button>
          )}
        </div>
      </div>

      <div className="pb-8 pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Seus dados ficam seguros. Sem anúncios. Sem julgamento.
        </p>
      </div>
    </div>
  );
};

export default Index;
