import { Lock, BookOpen, Target, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const educationItems = [
  { emoji: "💸", title: "Por que o dinheiro acaba antes do mês?" },
  { emoji: "💪", title: "Como sobreviver com salário mínimo" },
  { emoji: "🛡️", title: "Reserva de emergência na vida real" },
  { emoji: "🔓", title: "Dívida não é sentença de morte" },
  { emoji: "🧠", title: "Compra por impulso: como parar" },
  { emoji: "⚠️", title: "Pix parcelado e cartão: armadilhas" },
  { emoji: "📊", title: "O que é Renda Fixa?" },
  { emoji: "🏦", title: "CDB com Liquidez Diária" },
  { emoji: "🚀", title: "Como investir passo a passo" },
  { emoji: "🇧🇷", title: "Tesouro Direto: investindo no governo" },
  { emoji: "🌾", title: "LCI e LCA: renda fixa sem imposto" },
  { emoji: "📈", title: "Poupança x CDB x Tesouro: qual rende mais?" },
  { emoji: "💰", title: "Quanto investir por mês?" },
  { emoji: "🚫", title: "Erros comuns de quem começa a investir" },
];

const missionItems = [
  { emoji: "✂️", title: "Reduza um gasto desnecessário", category: "Economia" },
  { emoji: "💰", title: "Guarde qualquer valor", category: "Reserva" },
  { emoji: "📝", title: "Anote todos os gastos de hoje", category: "Economia" },
  { emoji: "🔍", title: "Compare preços antes de comprar", category: "Economia" },
  { emoji: "🏦", title: "Pesquise como renegociar uma dívida", category: "Dívida" },
];

const sosItems = [
  { emoji: "💼", title: "Desemprego", actions: "6 ações recomendadas" },
  { emoji: "🏥", title: "Doença na família", actions: "5 ações recomendadas" },
  { emoji: "🌊", title: "Enchente / Desastre", actions: "5 ações recomendadas" },
  { emoji: "📈", title: "Crise de preços / Inflação", actions: "5 ações recomendadas" },
];

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

      <div className="w-full max-w-sm md:max-w-5xl mx-auto space-y-8 md:space-y-12">

        {/* Educação Financeira */}
        <div className="scroll-reveal opacity-0 translate-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-extrabold text-foreground">📚 Educação Financeira</h3>
              <p className="text-xs text-muted-foreground">{educationItems.length} artigos práticos</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {educationItems.map((item, i) => (
              <div
                key={i}
                className="relative bg-card rounded-xl p-3 border shadow-sm flex items-center gap-3 overflow-hidden group"
              >
                <span className="text-xl shrink-0">{item.emoji}</span>
                <span className="text-sm font-semibold text-foreground flex-1 line-clamp-1">{item.title}</span>
                <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/80 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Missões Semanais */}
        <div className="scroll-reveal opacity-0 translate-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-extrabold text-foreground">🎯 Missões Semanais</h3>
              <p className="text-xs text-muted-foreground">Missões personalizadas para seu perfil</p>
            </div>
          </div>
          <div className="space-y-2">
            {missionItems.map((item, i) => (
              <div
                key={i}
                className="relative bg-card rounded-xl p-4 border shadow-sm flex items-center gap-3 overflow-hidden"
              >
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">{item.title}</p>
                </div>
                <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Modo SOS */}
        <div className="scroll-reveal opacity-0 translate-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-extrabold text-foreground">🚨 Modo Emergência (SOS)</h3>
              <p className="text-xs text-muted-foreground">Planos de ação para crises reais</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sosItems.map((item, i) => (
              <div
                key={i}
                className="relative bg-card rounded-xl p-4 border shadow-sm flex items-center gap-4 overflow-hidden"
              >
                <span className="text-3xl shrink-0">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.actions}</p>
                </div>
                <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="scroll-reveal opacity-0 translate-y-6 text-center pt-4">
          <div className="bg-gradient-to-br from-brand-green/10 via-brand-gold/5 to-brand-blue/10 rounded-2xl p-6 md:p-10 border">
            <Lock className="w-10 h-10 text-brand-gold mx-auto mb-3" />
            <h3 className="text-lg md:text-xl font-extrabold text-foreground mb-2">
              Desbloqueie tudo com o Premium
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              Acesse todos os conteúdos, missões personalizadas e planos de emergência
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
    </div>
  );
};

export default ContentPreview;
