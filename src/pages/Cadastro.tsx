import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinancialData } from "@/hooks/useFinancialData";
import { ArrowRight, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const steps = [
  { key: "renda", label: "Quanto você ganha por mês?", placeholder: "Ex: 2500", type: "number" },
  { key: "gastos", label: "Quanto você gasta por mês?", placeholder: "Ex: 2000", type: "number" },
  { key: "temDividas", label: "Você tem dívidas?", type: "boolean" },
  { key: "dependentes", label: "Quantas pessoas dependem de você?", placeholder: "Ex: 2", type: "number" },
  { key: "temReserva", label: "Você tem alguma reserva de emergência?", type: "boolean" },
  { key: "whatsapp", label: "Qual seu WhatsApp? (para notificações)", placeholder: "Ex: 11999999999", type: "phone" },
];

const Cadastro = () => {
  const navigate = useNavigate();
  const { saveData } = useFinancialData();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    renda: "",
    gastos: "",
    temDividas: false,
    dependentes: "",
    temReserva: false,
    valorReserva: "",
    whatsapp: "",
  });
  const [showReserva, setShowReserva] = useState(false);

  const current = steps[step];

  const handleNext = async () => {
    if (step === 5 && formData.temReserva && !showReserva) {
      setShowReserva(true);
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
      setShowReserva(false);
    } else {
      const { data: { user } } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
      if (user && formData.whatsapp) {
        await (await import("@/integrations/supabase/client")).supabase
          .from("profiles")
          .update({ whatsapp: formData.whatsapp } as any)
          .eq("user_id", user.id);
      }
      await saveData({
        renda: Number(formData.renda) || 0,
        gastos: Number(formData.gastos) || 0,
        temDividas: formData.temDividas,
        dependentes: Number(formData.dependentes) || 0,
        temReserva: formData.temReserva,
        valorReserva: Number(formData.valorReserva) || 0,
        onboardingDone: true,
      });
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (showReserva) {
      setShowReserva(false);
    } else if (step > 0) {
      setStep(step - 1);
    } else {
      navigate("/");
    }
  };

  const setValue = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)]" />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 flex flex-col px-6 py-8 min-h-screen">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-2">
          <button onClick={handleBack} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= step ? "bg-brand-green" : "bg-primary-foreground/20"}`} />
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50 mb-8">Passo {step + 1} de {steps.length}</p>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Futuro Real Brasil" className="w-36 drop-shadow-lg" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {showReserva ? (
            <div key="reserva" className="animate-fade-up">
              <Label className="text-xl font-bold text-primary-foreground block mb-6">Quanto você tem guardado?</Label>
              <Input type="number" placeholder="Ex: 500" value={formData.valorReserva} onChange={(e) => setValue("valorReserva", e.target.value)} className="h-14 text-lg rounded-xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40" inputMode="numeric" />
              <p className="text-xs text-primary-foreground/50 mt-2">Opcional — pode deixar em branco.</p>
            </div>
          ) : (
            <div key={step} className="animate-fade-up">
              <Label className="text-xl font-bold text-primary-foreground block mb-6">{current.label}</Label>
              {current.type === "number" && (
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/50 font-semibold">R$</span>
                    <Input type="number" placeholder={current.placeholder} value={formData[current.key as keyof typeof formData] as string} onChange={(e) => setValue(current.key, e.target.value)} className="h-14 text-lg rounded-xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 pl-12" inputMode="numeric" />
                  </div>
                  <p className="text-xs text-primary-foreground/50 mt-2">Opcional — pode deixar em branco.</p>
                </div>
              )}
              {current.type === "boolean" && (
                <div className="flex gap-3">
                  {[{ label: "Sim", value: true }, { label: "Não", value: false }].map((opt) => (
                    <button key={opt.label} onClick={() => setValue(current.key, opt.value)} className={`flex-1 h-14 rounded-xl border-2 text-base font-bold transition-all ${formData[current.key as keyof typeof formData] === opt.value ? "border-brand-green bg-brand-green/20 text-brand-green" : "border-primary-foreground/20 bg-white/5 text-primary-foreground"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
              {current.type === "phone" && (
                <div>
                  <Input type="tel" placeholder={current.placeholder} value={formData[current.key as keyof typeof formData] as string} onChange={(e) => setValue(current.key, e.target.value)} className="h-14 text-lg rounded-xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40" inputMode="tel" />
                  <p className="text-xs text-primary-foreground/50 mt-2">Obrigatório para receber lembretes de estudo.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message + Next */}
        <div className="max-w-sm mx-auto w-full">
          <p className="text-center text-sm text-primary-foreground/40 mb-4 italic">"Aqui ninguém julga. Aqui a gente resolve."</p>
          <Button onClick={handleNext} className="w-full h-14 text-base font-bold rounded-xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground shadow-lg" size="lg">
            {step === steps.length - 1 && (!formData.temReserva || showReserva) ? "Ver meu futuro" : "Próximo"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
