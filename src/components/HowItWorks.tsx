import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserPlus, LogIn, BarChart3, Target, CreditCard, CheckCircle2 } from "lucide-react";

interface HowItWorksProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  { icon: UserPlus, title: "1. Crie sua conta", desc: "Cadastre-se com e-mail ou Google em segundos." },
  { icon: LogIn, title: "2. Faça login", desc: "Acesse com suas credenciais e confirme seu e-mail." },
  { icon: BarChart3, title: "3. Preencha seus dados", desc: "Informe renda, gastos e dívidas para uma simulação personalizada." },
  { icon: Target, title: "4. Complete missões", desc: "Missões semanais para melhorar sua saúde financeira." },
  { icon: CheckCircle2, title: "5. Acompanhe seu progresso", desc: "Veja simulações, gráficos e evolução mês a mês." },
  { icon: CreditCard, title: "6. Assine o Premium", desc: "Desbloqueie tudo por R$19,90/mês — menos que um café por semana." },
];

export default function HowItWorks({ open, onClose }: HowItWorksProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm md:max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-extrabold text-foreground text-center mb-6">Como funciona</h2>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                <step.icon className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
