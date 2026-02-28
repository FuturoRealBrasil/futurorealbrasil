import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinancialData } from "@/hooks/useFinancialData";
import { ArrowRight, ArrowLeft } from "lucide-react";

const steps = [
  { key: "renda", label: "Quanto você ganha por mês?", placeholder: "Ex: 2500", type: "number" },
  { key: "gastos", label: "Quanto você gasta por mês?", placeholder: "Ex: 2000", type: "number" },
  { key: "temDividas", label: "Você tem dívidas?", type: "boolean" },
  { key: "dependentes", label: "Quantas pessoas dependem de você?", placeholder: "Ex: 2", type: "number" },
  { key: "temReserva", label: "Você tem alguma reserva de emergência?", type: "boolean" },
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
  });
  const [showReserva, setShowReserva] = useState(false);

  const current = steps[step];

  const handleNext = async () => {
    if (step === 4 && formData.temReserva && !showReserva) {
      setShowReserva(true);
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
      setShowReserva(false);
    } else {
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
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={handleBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-8">Passo {step + 1} de {steps.length}</p>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {showReserva ? (
          <div key="reserva" className="animate-fade-up">
            <Label className="text-xl font-bold text-foreground block mb-6">Quanto você tem guardado?</Label>
            <Input type="number" placeholder="Ex: 500" value={formData.valorReserva} onChange={(e) => setValue("valorReserva", e.target.value)} className="h-14 text-lg rounded-xl bg-card" inputMode="numeric" />
            <p className="text-xs text-muted-foreground mt-2">Opcional — pode deixar em branco.</p>
          </div>
        ) : (
          <div key={step} className="animate-fade-up">
            <Label className="text-xl font-bold text-foreground block mb-6">{current.label}</Label>
            {current.type === "number" && (
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                  <Input type="number" placeholder={current.placeholder} value={formData[current.key as keyof typeof formData] as string} onChange={(e) => setValue(current.key, e.target.value)} className="h-14 text-lg rounded-xl bg-card pl-12" inputMode="numeric" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Opcional — pode deixar em branco.</p>
              </div>
            )}
            {current.type === "boolean" && (
              <div className="flex gap-3">
                {[{ label: "Sim", value: true }, { label: "Não", value: false }].map((opt) => (
                  <button key={opt.label} onClick={() => setValue(current.key, opt.value)} className={`flex-1 h-14 rounded-xl border-2 text-base font-bold transition-all ${formData[current.key as keyof typeof formData] === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message + Next */}
      <div className="max-w-sm mx-auto w-full">
        <p className="text-center text-sm text-muted-foreground mb-4 italic">"Aqui ninguém julga. Aqui a gente resolve."</p>
        <Button onClick={handleNext} className="w-full h-14 text-base font-bold rounded-xl" size="lg">
          {step === steps.length - 1 && (!formData.temReserva || showReserva) ? "Ver meu futuro" : "Próximo"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Cadastro;
