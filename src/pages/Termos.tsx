import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Termos = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)] px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-primary-foreground/70 hover:text-primary-foreground mb-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-primary-foreground">Termos de Uso</h1>
          <p className="text-sm text-primary-foreground/60 mt-1">Futuro Real Brasil</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto prose prose-sm text-foreground space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ao utilizar a plataforma Futuro Real Brasil, o usuário concorda com os seguintes termos:
          </p>

          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed list-disc pl-4">
            <li>O Futuro Real Brasil é uma plataforma de orientação e simulação financeira, não sendo uma instituição financeira, banco ou consultoria de investimentos.</li>
            <li>As análises e recomendações apresentadas possuem caráter educacional e informativo, cabendo ao usuário a decisão final sobre suas finanças.</li>
            <li>O acesso à plataforma é realizado mediante assinatura mensal no valor de R$ 19,90, com fidelidade mínima de 12 meses.</li>
            <li>A assinatura permite acesso às funcionalidades de planejamento financeiro, simulações e acompanhamento de evolução financeira.</li>
            <li>O usuário se compromete a fornecer informações verdadeiras para obter análises mais precisas.</li>
            <li>O Futuro Real Brasil não se responsabiliza por decisões financeiras tomadas exclusivamente com base nas simulações da plataforma.</li>
            <li>O uso da plataforma implica aceitação integral destes termos.</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Termos;
