import { BookOpen, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

const articles = [
  { title: "Por que o dinheiro acaba antes do mês?", content: "Geralmente, são os pequenos gastos do dia a dia que drenam sua renda sem você perceber. Um café aqui, um lanche ali... Some tudo no final do mês e você vai se surpreender. A solução? Anote tudo por uma semana.", emoji: "💸", color: "bg-danger/5 border-danger/20" },
  { title: "Como sobreviver com salário mínimo", content: "É difícil, mas possível. A chave é priorizar: moradia, alimentação e transporte primeiro. Depois, corte tudo que não é essencial. Use programas do governo. Compre no atacado. Cozinhe em casa.", emoji: "💪", color: "bg-primary/5 border-primary/20" },
  { title: "Reserva de emergência na vida real", content: "Esqueça o papo de 'guardar 6 meses de salário'. Comece com R$ 50. Depois R$ 100. O importante é ter algo guardado para imprevistos.", emoji: "🛡️", color: "bg-safe/5 border-safe/20" },
  { title: "Dívida não é sentença de morte", content: "Existem formas de sair: Serasa Limpa Nome, mutirões de renegociação. O primeiro passo é saber quanto você deve e para quem.", emoji: "🔓", color: "bg-warning/5 border-warning/20" },
  { title: "Compra por impulso: como parar", content: "Regra dos 3 dias: viu algo que quer comprar? Espere 3 dias. 80% das vezes o desejo passa.", emoji: "🧠", color: "bg-accent/5 border-accent/20" },
  { title: "Pix parcelado e cartão: armadilhas", content: "Antes de parcelar, some todas as parcelas que você já paga. Se passar de 30% da sua renda, pare.", emoji: "⚠️", color: "bg-danger/5 border-danger/20" },
];

const Educacao = () => {
  const { isPremium } = useAuth();
  const navigate = useNavigate();

  if (!isPremium) {
    return (
      <AppLayout>
        <div className="px-5 py-6 pb-24 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-card rounded-2xl p-8 border shadow-sm text-center animate-fade-up">
            <Lock className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-foreground mb-2">Educação Financeira</h2>
            <p className="text-sm text-muted-foreground mb-6">Conteúdos práticos para transformar sua relação com o dinheiro. Disponível no plano Premium.</p>
            <Button onClick={() => navigate("/planos")} className="w-full h-12 rounded-xl font-bold" size="lg">Ver Planos</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Educação Financeira
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Conteúdos práticos, sem enrolação</p>
        </div>
        <div className="space-y-4">
          {articles.map((article, i) => (
            <details key={i} className="bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-up group" style={{ animationDelay: `${i * 0.05}s` }}>
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none hover:bg-muted/30 transition-colors">
                <span className="text-2xl">{article.emoji}</span>
                <span className="text-sm font-bold text-foreground flex-1">{article.title}</span>
                <span className="text-muted-foreground text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 pt-0">
                <div className={`rounded-lg p-4 ${article.color}`}>
                  <p className="text-sm text-foreground leading-relaxed">{article.content}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Educacao;
