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
  { title: "O que é Renda Fixa?", content: "Renda fixa é um tipo de investimento onde você sabe, na hora de investir, quanto vai receber de volta. É como emprestar dinheiro para o banco ou o governo e receber juros por isso. É o investimento mais seguro para quem está começando. Exemplos: CDB, Tesouro Direto, LCI e LCA.", emoji: "📊", color: "bg-safe/5 border-safe/20" },
  { title: "CDB com Liquidez Diária: seu dinheiro rende e fica disponível", content: "O CDB (Certificado de Depósito Bancário) com liquidez diária é perfeito para a reserva de emergência. Seu dinheiro rende mais que a poupança e você pode resgatar a qualquer momento. Procure CDBs que pagam pelo menos 100% do CDI. O investimento é protegido pelo FGC (Fundo Garantidor de Créditos) até R$ 250 mil por banco.", emoji: "🏦", color: "bg-primary/5 border-primary/20" },
  { title: "Como investir passo a passo", content: "1️⃣ Abra uma conta em uma corretora gratuita (Nu Invest, Rico, Clear, XP). Basta baixar o app e enviar seus documentos.\n\n2️⃣ Transfira dinheiro via Pix da sua conta bancária para a corretora.\n\n3️⃣ No app da corretora, vá em 'Renda Fixa' e escolha um CDB com liquidez diária (100% CDI ou mais).\n\n4️⃣ Digite o valor que quer investir e confirme.\n\n5️⃣ Pronto! Seu dinheiro já está rendendo. Você pode acompanhar pelo app.", emoji: "🚀", color: "bg-accent/5 border-accent/20" },
  { title: "Tesouro Direto: investindo no governo", content: "O Tesouro Direto é o investimento mais seguro do Brasil — você empresta dinheiro para o governo federal. Tem três tipos principais:\n\n• Tesouro Selic: rende junto com a taxa Selic, ideal para reserva de emergência.\n• Tesouro IPCA+: protege contra a inflação, bom para metas de médio/longo prazo.\n• Tesouro Prefixado: taxa fixa, você sabe exatamente quanto vai receber.\n\nInvestimento mínimo: a partir de R$ 30.", emoji: "🇧🇷", color: "bg-safe/5 border-safe/20" },
  { title: "LCI e LCA: renda fixa sem imposto de renda", content: "LCI (Letra de Crédito Imobiliário) e LCA (Letra de Crédito do Agronegócio) são investimentos de renda fixa ISENTOS de Imposto de Renda para pessoa física. Isso significa que o rendimento é líquido — o que rende é o que você leva. Desvantagem: geralmente não têm liquidez diária, então são melhores para dinheiro que você não vai precisar por alguns meses.", emoji: "🌾", color: "bg-warning/5 border-warning/20" },
  { title: "Poupança x CDB x Tesouro: qual rende mais?", content: "Comparando R$ 1.000 investidos por 1 ano (valores aproximados):\n\n• Poupança: R$ 1.061 (rende ~6,17% ao ano)\n• CDB 100% CDI: R$ 1.086 (rende ~10,65% bruto, ~8,7% líquido)\n• Tesouro Selic: R$ 1.085 (rende ~10,5% bruto, ~8,6% líquido)\n\nA poupança SEMPRE rende menos. Migre para CDB ou Tesouro assim que possível.", emoji: "📈", color: "bg-danger/5 border-danger/20" },
  { title: "Quanto investir por mês?", content: "Não existe valor mínimo 'correto'. Comece com o que puder: R$ 10, R$ 30, R$ 50. O mais importante é a consistência. Investir R$ 50 todo mês é melhor do que investir R$ 500 uma vez e nunca mais. Use a regra 50-30-20: 50% para necessidades, 30% para desejos e 20% para investimentos.", emoji: "💰", color: "bg-primary/5 border-primary/20" },
  { title: "Erros comuns de quem começa a investir", content: "❌ Investir sem ter reserva de emergência\n❌ Colocar todo o dinheiro em um único investimento\n❌ Resgatar antes do prazo por impulso\n❌ Não pesquisar taxas e custos\n❌ Acreditar em promessas de 'rendimento garantido' muito alto\n\n✅ Monte sua reserva de emergência primeiro, diversifique, tenha paciência e desconfie de retornos altos demais.", emoji: "🚫", color: "bg-danger/5 border-danger/20" },
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
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{article.content}</p>
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
