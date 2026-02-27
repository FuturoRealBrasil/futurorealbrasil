import { useNavigate } from "react-router-dom";
import { Shield, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/lib/storage";

const Index = () => {
  const navigate = useNavigate();
  const data = getUserData();

  const handleStart = () => {
    if (data.onboardingDone) {
      navigate("/dashboard");
    } else {
      navigate("/cadastro");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-8 animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground leading-tight mb-2">
            Futuro Real Brasil
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
            Antes que a vida te pegue de surpresa,{" "}
            <span className="text-primary font-bold">veja o futuro.</span>
          </p>
        </div>

        {/* Features */}
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

        {/* CTAs */}
        <div className="w-full max-w-sm space-y-3 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <Button onClick={handleStart} className="w-full h-14 text-base font-bold rounded-xl" size="lg">
            Começar agora
          </Button>
          {data.onboardingDone && (
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full h-12 text-base font-semibold rounded-xl">
              Entrar
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Seus dados ficam no seu celular. Sem anúncios. Sem julgamento.
        </p>
      </div>
    </div>
  );
};

export default Index;
