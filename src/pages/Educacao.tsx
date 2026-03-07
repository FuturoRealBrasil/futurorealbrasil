import { BookOpen, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

const levelInfo = {
  iniciante: { label: "🌱 Iniciante", color: "bg-brand-blue/10 text-brand-blue border-brand-blue/20", desc: "Conceitos básicos para quem está começando a organizar as finanças." },
  organizado: { label: "📋 Organizado", color: "bg-brand-green/10 text-brand-green border-brand-green/20", desc: "Estratégias para planejar melhor e cortar desperdícios." },
  investidor: { label: "📈 Investidor", color: "bg-brand-gold/10 text-brand-gold border-brand-gold/20", desc: "Aprenda a fazer o dinheiro trabalhar por você." },
  independente: { label: "🏆 Independente", color: "bg-accent/10 text-accent border-accent/20", desc: "Conhecimento avançado para liberdade financeira." },
};

const articles = [
  { title: "Por que o dinheiro acaba antes do mês?", content: "Geralmente, são os pequenos gastos do dia a dia que drenam sua renda sem você perceber. Um café aqui, um lanche ali... Some tudo no final do mês e você vai se surpreender. A solução? Anote tudo por uma semana.", emoji: "💸", color: "bg-danger/5 border-danger/20", level: "iniciante" as const },
  { title: "Como sobreviver com salário mínimo", content: "É difícil, mas possível. A chave é priorizar: moradia, alimentação e transporte primeiro. Depois, corte tudo que não é essencial. Use programas do governo. Compre no atacado. Cozinhe em casa.", emoji: "💪", color: "bg-primary/5 border-primary/20", level: "iniciante" as const },
  { title: "Reserva de emergência na vida real", content: "Esqueça o papo de 'guardar 6 meses de salário'. Comece com R$ 50. Depois R$ 100. O importante é ter algo guardado para imprevistos.", emoji: "🛡️", color: "bg-safe/5 border-safe/20", level: "iniciante" as const },
  { title: "Dívida não é sentença de morte", content: "Existem formas de sair: Serasa Limpa Nome, mutirões de renegociação. O primeiro passo é saber quanto você deve e para quem.", emoji: "🔓", color: "bg-warning/5 border-warning/20", level: "organizado" as const },
  { title: "Compra por impulso: como parar", content: "Regra dos 3 dias: viu algo que quer comprar? Espere 3 dias. 80% das vezes o desejo passa.", emoji: "🧠", color: "bg-accent/5 border-accent/20", level: "organizado" as const },
  { title: "Pix parcelado e cartão: armadilhas", content: "Antes de parcelar, some todas as parcelas que você já paga. Se passar de 30% da sua renda, pare.", emoji: "⚠️", color: "bg-danger/5 border-danger/20", level: "organizado" as const },
  { title: "O que é Renda Fixa?", content: "Renda fixa é um tipo de investimento onde você sabe, na hora de investir, quanto vai receber de volta. É como emprestar dinheiro para o banco ou o governo e receber juros por isso. É o investimento mais seguro para quem está começando. Exemplos: CDB, Tesouro Direto, LCI e LCA.", emoji: "📊", color: "bg-safe/5 border-safe/20", level: "investidor" as const },
  { title: "CDB com Liquidez Diária: seu dinheiro rende e fica disponível", content: "O CDB (Certificado de Depósito Bancário) com liquidez diária é perfeito para a reserva de emergência. Seu dinheiro rende mais que a poupança e você pode resgatar a qualquer momento. Procure CDBs que pagam pelo menos 100% do CDI.", emoji: "🏦", color: "bg-primary/5 border-primary/20", level: "investidor" as const },
  { title: "Como investir passo a passo", content: "1️⃣ Abra uma conta em uma corretora gratuita (Nu Invest, Rico, Clear, XP).\n\n2️⃣ Transfira dinheiro via Pix.\n\n3️⃣ No app, vá em 'Renda Fixa' e escolha um CDB com liquidez diária.\n\n4️⃣ Digite o valor e confirme.\n\n5️⃣ Pronto! Seu dinheiro já está rendendo.", emoji: "🚀", color: "bg-accent/5 border-accent/20", level: "investidor" as const },
  { title: "Tesouro Direto: investindo no governo", content: "O Tesouro Direto é o investimento mais seguro do Brasil.\n\n• Tesouro Selic: ideal para reserva de emergência.\n• Tesouro IPCA+: protege contra a inflação.\n• Tesouro Prefixado: taxa fixa.\n\nInvestimento mínimo: a partir de R$ 30.", emoji: "🇧🇷", color: "bg-safe/5 border-safe/20", level: "investidor" as const },
  { title: "LCI e LCA: renda fixa sem imposto de renda", content: "LCI e LCA são investimentos ISENTOS de Imposto de Renda para pessoa física. O rendimento é líquido. Desvantagem: geralmente não têm liquidez diária.", emoji: "🌾", color: "bg-warning/5 border-warning/20", level: "independente" as const },
  { title: "Poupança x CDB x Tesouro: qual rende mais?", content: "Comparando R$ 1.000 por 1 ano:\n\n• Poupança: R$ 1.061 (~6,17% ao ano)\n• CDB 100% CDI: R$ 1.086 (~8,7% líquido)\n• Tesouro Selic: R$ 1.085 (~8,6% líquido)\n\nA poupança SEMPRE rende menos.", emoji: "📈", color: "bg-danger/5 border-danger/20", level: "independente" as const },
  { title: "Quanto investir por mês?", content: "Comece com o que puder: R$ 10, R$ 30, R$ 50. O mais importante é a consistência. Use a regra 50-30-20: 50% necessidades, 30% desejos e 20% investimentos.", emoji: "💰", color: "bg-primary/5 border-primary/20", level: "independente" as const },
  { title: "Erros comuns de quem começa a investir", content: "❌ Investir sem reserva de emergência\n❌ Colocar tudo em um único investimento\n❌ Resgatar antes do prazo\n❌ Não pesquisar taxas\n❌ Acreditar em promessas de retorno alto\n\n✅ Monte reserva primeiro, diversifique, tenha paciência.", emoji: "🚫", color: "bg-danger/5 border-danger/20", level: "independente" as const },
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
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Educação Financeira
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Conteúdos práticos, sem enrolação</p>
        </div>

        {(["iniciante", "organizado", "investidor", "independente"] as const).map((level) => {
          const lvl = levelInfo[level];
          const levelArticles = articles.filter(a => a.level === level);
          if (levelArticles.length === 0) return null;

          return (
            <div key={level} className="mb-6">
              <div className={`rounded-xl p-3 mb-3 border ${lvl.color}`}>
                <span className="text-sm font-bold">{lvl.label}</span>
                <p className="text-xs mt-1 opacity-80">{lvl.desc}</p>
              </div>

              <div className="space-y-3">
                {levelArticles.map((article, i) => (
                  <details key={i} className="bg-card rounded-xl border shadow-sm overflow-hidden group">
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
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Educacao;
