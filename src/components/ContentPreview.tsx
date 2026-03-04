import { Lock, BookOpen, Target, Zap, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ContentPreview = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-10 md:py-16">
      <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-foreground text-center mb-2 scroll-reveal opacity-0 translate-y-6">
        O que você vai <span className="text-brand-green">desbloquear</span>
      </h2>
      <p className="text-sm md:text-base text-muted-foreground text-center mb-8 md:mb-12 max-w-xs md:max-w-lg mx-auto scroll-reveal opacity-0 translate-y-6">
        Conteúdos exclusivos para transformar sua vida financeira
      </p>

      <div className="w-full max-w-sm md:max-w-5xl mx-auto space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">

        {/* Educação Financeira */}
        <div className="scroll-reveal opacity-0 translate-y-6 bg-card rounded-2xl border shadow-sm p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-brand-gold" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Educação Financeira</h3>
                <p className="text-xs text-muted-foreground">14 artigos práticos</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {[
                "Aprenda a controlar seus gastos",
                "Investimentos para iniciantes",
                "Saia das dívidas de vez",
                "Construa sua reserva",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span className="text-xs font-semibold text-foreground">{item}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 bg-muted/20 rounded-lg p-2.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground">+ 10 artigos exclusivos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Missões Semanais */}
        <div className="scroll-reveal opacity-0 translate-y-6 bg-card rounded-2xl border shadow-sm p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Missões Semanais</h3>
                <p className="text-xs text-muted-foreground">Personalizadas para você</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {[
                "Missões de economia diária",
                "Desafios para criar reserva",
                "Metas de renegociação",
                "Hábitos financeiros saudáveis",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-green/50 shrink-0" />
                  <span className="text-xs font-semibold text-foreground">{item}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 bg-muted/20 rounded-lg p-2.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground">+ missões baseadas no seu perfil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modo SOS */}
        <div className="scroll-reveal opacity-0 translate-y-6 bg-card rounded-2xl border shadow-sm p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Modo Emergência</h3>
                <p className="text-xs text-muted-foreground">Planos de ação para crises</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {[
                "Plano para perda de renda",
                "Guia para emergências médicas",
                "Ação em desastres naturais",
                "Estratégias contra inflação",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5">
                  <span className="text-xs text-destructive shrink-0">⚡</span>
                  <span className="text-xs font-semibold text-foreground">{item}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 bg-muted/20 rounded-lg p-2.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground">+ checklists completos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="scroll-reveal opacity-0 translate-y-6 text-center pt-8 md:pt-12 max-w-sm md:max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-brand-green/10 via-brand-gold/5 to-brand-blue/10 rounded-2xl p-6 md:p-10 border">
          <Lock className="w-10 h-10 text-brand-gold mx-auto mb-3" />
          <h3 className="text-lg md:text-xl font-extrabold text-foreground mb-2">
            Desbloqueie tudo com o Premium
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            Acesse todos os conteúdos, missões e planos de emergência
          </p>
          <Button
            onClick={() => navigate("/auth")}
            className="h-12 px-8 text-base font-bold rounded-xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground shadow-lg"
            size="lg"
          >
            Começar agora <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;
