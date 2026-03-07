import { ArrowLeft, UserPlus, LogIn, BarChart3, Target, CheckCircle2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: UserPlus,
    title: "1. Crie sua conta",
    desc: "Cadastre-se com e-mail ou Google em segundos.",
    screenshot: "/auth?mode=signup",
    mockup: (
      <div className="bg-card rounded-xl border p-4 space-y-3">
        <div className="text-center mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Criar Conta</p>
        </div>
        <div className="space-y-2">
          <div className="h-9 bg-muted rounded-lg flex items-center px-3"><span className="text-xs text-muted-foreground">Seu nome</span></div>
          <div className="h-9 bg-muted rounded-lg flex items-center px-3"><span className="text-xs text-muted-foreground">seu@email.com</span></div>
          <div className="h-9 bg-muted rounded-lg flex items-center px-3"><span className="text-xs text-muted-foreground">••••••••</span></div>
          <div className="h-9 bg-brand-green rounded-lg flex items-center justify-center"><span className="text-xs font-bold text-primary-foreground">Criar Conta</span></div>
        </div>
      </div>
    ),
  },
  {
    icon: LogIn,
    title: "2. Faça login",
    desc: "Acesse com suas credenciais e confirme seu e-mail.",
    mockup: (
      <div className="bg-card rounded-xl border p-4 space-y-3">
        <div className="text-center mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Entrar</p>
        </div>
        <div className="space-y-2">
          <div className="h-9 bg-muted rounded-lg flex items-center px-3"><span className="text-xs text-muted-foreground">seu@email.com</span></div>
          <div className="h-9 bg-muted rounded-lg flex items-center px-3"><span className="text-xs text-muted-foreground">••••••••</span></div>
          <div className="h-9 bg-primary rounded-lg flex items-center justify-center"><span className="text-xs font-bold text-primary-foreground">Entrar</span></div>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "3. Preencha seus dados",
    desc: "Informe renda, gastos e dívidas para uma simulação personalizada.",
    mockup: (
      <div className="bg-card rounded-xl border p-4 space-y-3">
        <p className="text-sm font-bold text-foreground text-center">Seus Dados Financeiros</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-muted rounded-lg p-2.5">
            <span className="text-xs text-muted-foreground">Renda mensal</span>
            <span className="text-xs font-bold text-brand-green">R$ 3.500</span>
          </div>
          <div className="flex justify-between items-center bg-muted rounded-lg p-2.5">
            <span className="text-xs text-muted-foreground">Gastos mensais</span>
            <span className="text-xs font-bold text-destructive">R$ 2.800</span>
          </div>
          <div className="flex justify-between items-center bg-muted rounded-lg p-2.5">
            <span className="text-xs text-muted-foreground">Dívidas</span>
            <span className="text-xs font-bold text-brand-gold">R$ 5.000</span>
          </div>
          <div className="flex justify-between items-center bg-muted rounded-lg p-2.5">
            <span className="text-xs text-muted-foreground">Dependentes</span>
            <span className="text-xs font-bold text-foreground">2</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    title: "4. Complete missões",
    desc: "Missões semanais para melhorar sua saúde financeira.",
    mockup: (
      <div className="bg-card rounded-xl border p-4 space-y-3">
        <p className="text-sm font-bold text-foreground text-center">Missões da Semana</p>
        <div className="space-y-2">
          {["Anotar todos os gastos de hoje", "Cozinhar em casa 3x esta semana", "Comparar preços antes de comprar", "Guardar R$10 hoje"].map((m, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted rounded-lg p-2.5">
              <div className={`w-4 h-4 rounded-full border-2 ${i < 2 ? "bg-brand-green border-brand-green" : "border-muted-foreground/30"} shrink-0 flex items-center justify-center`}>
                {i < 2 && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className={`text-xs font-semibold ${i < 2 ? "text-muted-foreground line-through" : "text-foreground"}`}>{m}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: CheckCircle2,
    title: "5. Acompanhe seu progresso",
    desc: "Veja simulações, gráficos e evolução mês a mês.",
    mockup: (
      <div className="bg-card rounded-xl border p-4 space-y-3">
        <p className="text-sm font-bold text-foreground text-center">Seu Progresso</p>
        <div className="flex items-end justify-center gap-2 h-24">
          {[30, 45, 55, 70, 85, 95].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-6 rounded-t-md bg-brand-green/80" style={{ height: `${h}%` }} />
              <span className="text-[10px] text-muted-foreground">{["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"][i]}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Reserva: <span className="font-bold text-brand-green">R$ 1.200</span></span>
          <span className="text-muted-foreground">Meta: <span className="font-bold text-foreground">R$ 5.000</span></span>
        </div>
      </div>
    ),
  },
  {
    icon: CreditCard,
    title: "6. Assine o Premium",
    desc: "Desbloqueie tudo por R$19,90/mês ou R$219,90/ano.",
    mockup: (
      <div className="bg-card rounded-xl border p-4 space-y-3">
        <p className="text-sm font-bold text-foreground text-center">Planos Premium</p>
        <div className="space-y-2">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-foreground">Mensal</span>
              <span className="text-sm font-extrabold text-brand-gold">R$19,90<span className="text-[10px] text-muted-foreground">/mês</span></span>
            </div>
          </div>
          <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-foreground">Anual</span>
                <span className="text-[10px] text-brand-green ml-1">Economize!</span>
              </div>
              <span className="text-sm font-extrabold text-brand-gold">R$219,90<span className="text-[10px] text-muted-foreground">/ano</span></span>
            </div>
          </div>
        </div>
        <div className="h-9 bg-brand-green rounded-lg flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">Assinar Agora</span>
        </div>
      </div>
    ),
  },
];

export default function ComoFunciona() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground flex-1 text-center pr-5">Como Funciona</h1>
        </div>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
              <div className="ml-[52px]">
                {step.mockup}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
