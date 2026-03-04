import { useNavigate } from "react-router-dom";
import { TrendingUp, Heart, Shield, ArrowRight, BarChart3, Target, BookOpen } from "lucide-react";
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
      {/* Hero Section - Dark overlay inspired */}
      <div className="relative overflow-hidden bg-primary text-primary-foreground">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-brand-blue" />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="animate-fade-up">
            <img
              src={logo}
              alt="Futuro Real Brasil"
              className="w-48 mx-auto mb-6 drop-shadow-lg"
              style={{ filter: "brightness(1.2)" }}
            />
          </div>

          <h1 className="text-3xl font-extrabold leading-tight mb-3 animate-fade-up max-w-sm" style={{ animationDelay: "0.15s" }}>
            Educação Financeira{" "}
            <span className="text-brand-gold">Acessível</span>
          </h1>

          <p className="text-base opacity-90 font-medium leading-relaxed max-w-xs mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            Antes que a vida te pegue de surpresa,{" "}
            <span className="text-brand-gold font-bold">veja o futuro.</span>
          </p>

          <div className="w-full max-w-sm space-y-3 animate-fade-up" style={{ animationDelay: "0.45s" }}>
            <Button
              onClick={handleStart}
              className="w-full h-14 text-base font-bold rounded-xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground shadow-lg"
              size="lg"
            >
              {user ? "Ir para o Dashboard" : "Começar agora"} <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            {!user && (
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="w-full h-12 text-base font-semibold rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Já tenho conta
              </Button>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L48 36C96 32 192 24 288 28C384 32 480 48 576 52C672 56 768 48 864 40C960 32 1056 24 1152 28C1248 32 1344 48 1392 56L1440 64V80H0V40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </div>

      {/* Why section */}
      <div className="px-6 py-10">
        <h2 className="text-lg font-extrabold text-foreground text-center mb-2">
          Por que usar o <span className="text-brand-green">Futuro Real</span>?
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs mx-auto">
          Ferramentas simples para transformar sua vida financeira
        </p>

        <div className="w-full max-w-sm mx-auto space-y-3">
          {[
            { icon: TrendingUp, text: "Preveja riscos antes que aconteçam", color: "text-brand-green" },
            { icon: Heart, text: "Proteja quem depende de você", color: "text-destructive" },
            { icon: Shield, text: "Sem julgamento. Só soluções.", color: "text-brand-blue" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm border animate-fade-up"
              style={{ animationDelay: `${0.6 + i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-sm font-semibold text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="px-6 pb-10">
        <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-3">
          {[
            { icon: BarChart3, label: "Simulações", color: "bg-brand-blue/10 text-brand-blue" },
            { icon: Target, label: "Missões", color: "bg-brand-green/10 text-brand-green" },
            { icon: BookOpen, label: "Educação", color: "bg-brand-gold/10 text-brand-gold" },
          ].map((feat, i) => (
            <div
              key={i}
              className="bg-card border rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm animate-fade-up"
              style={{ animationDelay: `${0.9 + i * 0.1}s` }}
            >
              <div className={`w-10 h-10 rounded-full ${feat.color} flex items-center justify-center`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground">{feat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 pt-4 text-center mt-auto">
        <p className="text-xs text-muted-foreground">
          🔒 Seus dados ficam seguros. Sem anúncios. Sem julgamento.
        </p>
      </div>
    </div>
  );
};

export default Index;
