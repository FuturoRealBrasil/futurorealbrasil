import { useState } from "react";
import { BookOpen, Lock, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
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

interface ArticlePage {
  title: string;
  content: string;
}

interface Article {
  title: string;
  emoji: string;
  color: string;
  level: "iniciante" | "organizado" | "investidor" | "independente";
  pages: ArticlePage[];
}

const articles: Article[] = [
  // INICIANTE
  {
    title: "Por que o dinheiro acaba antes do mês?",
    emoji: "💸",
    color: "bg-danger/5 border-danger/20",
    level: "iniciante",
    pages: [
      { title: "Introdução", content: "A maioria dos brasileiros sente que o dinheiro 'desaparece'. Você recebe o salário e, em poucos dias, já não sabe onde foi parar. Isso acontece porque não temos o hábito de acompanhar nossos gastos. Pequenas despesas do dia a dia — um café, um lanche, uma compra por impulso — se acumulam silenciosamente e drenam sua renda sem você perceber." },
      { title: "Explicação", content: "O problema não é necessariamente ganhar pouco, mas sim não ter visibilidade do que entra e do que sai. Quando você não anota seus gastos, perde o controle. Estudos mostram que pessoas que anotam suas despesas economizam em média 15% a mais por mês. Isso porque a consciência sobre o gasto muda o comportamento. Categorize seus gastos em: fixos (aluguel, luz, água), variáveis (alimentação, transporte) e supérfluos (lazer, compras por impulso)." },
      { title: "Dicas Práticas", content: "1️⃣ Anote TODOS os gastos por uma semana completa — sem exceção.\n2️⃣ Use o Futuro Real para categorizar seus gastos automaticamente.\n3️⃣ Some todos os 'gastos pequenos' — cafés, lanches, doces. Você vai se surpreender com o total.\n4️⃣ Identifique os 3 maiores 'ralos' de dinheiro e elimine pelo menos 1.\n5️⃣ Estabeleça um valor máximo diário para gastos variáveis." },
    ],
  },
  {
    title: "Como sobreviver com salário mínimo",
    emoji: "💪",
    color: "bg-primary/5 border-primary/20",
    level: "iniciante",
    pages: [
      { title: "Introdução", content: "Viver com salário mínimo no Brasil é um desafio diário enfrentado por milhões de famílias. Parece impossível guardar dinheiro quando mal dá para pagar as contas. Mas com planejamento e disciplina, é possível não apenas sobreviver, mas também começar a construir uma base financeira mais sólida." },
      { title: "Explicação", content: "A chave está na priorização radical. Com renda limitada, cada real conta. Divida seus gastos em ordem de importância: moradia, alimentação e transporte são inegociáveis. Todo o resto precisa ser questionado. Aproveite programas do governo como Bolsa Família, Tarifa Social de Energia, CadÚnico e farmácias populares. Compre no atacado sempre que possível — alimentos como arroz, feijão e óleo são muito mais baratos em quantidade. Cozinhe em casa: uma refeição caseira custa em média R$ 3 a R$ 5, contra R$ 15 a R$ 25 no delivery." },
      { title: "Dicas Práticas", content: "1️⃣ Faça uma lista de compras semanal e NÃO saia dela.\n2️⃣ Compre frutas e verduras em feiras livres no final do dia (preços menores).\n3️⃣ Troque marcas caras por genéricas — a qualidade é similar na maioria dos casos.\n4️⃣ Cadastre-se no CadÚnico para acessar benefícios do governo.\n5️⃣ Separe pelo menos R$ 10 por semana — mesmo que pareça pouco, são R$ 520 por ano." },
    ],
  },
  {
    title: "Reserva de emergência na vida real",
    emoji: "🛡️",
    color: "bg-safe/5 border-safe/20",
    level: "iniciante",
    pages: [
      { title: "Introdução", content: "Você já ouviu que precisa ter 6 meses de gastos guardados. Parece impossível, certo? A verdade é que a reserva de emergência não precisa começar grande. Ela precisa começar. Qualquer valor guardado já é melhor do que nada quando um imprevisto aparece." },
      { title: "Explicação", content: "A reserva de emergência é o dinheiro que você guarda para situações inesperadas: uma doença, um conserto urgente, a perda do emprego. Sem ela, qualquer imprevisto vira uma dívida. O ideal é ter de 3 a 6 meses de gastos essenciais guardados, mas você pode começar com metas menores: R$ 100, depois R$ 500, depois R$ 1.000. O importante é que esse dinheiro fique em um lugar seguro e acessível, como um CDB com liquidez diária ou Tesouro Selic." },
      { title: "Dicas Práticas", content: "1️⃣ Comece com R$ 50 por mês — ou R$ 12,50 por semana.\n2️⃣ Abra uma conta separada APENAS para a reserva.\n3️⃣ Configure transferência automática no dia do pagamento.\n4️⃣ NÃO use esse dinheiro para nada que não seja emergência real.\n5️⃣ A cada meta atingida, comemore e aumente o valor guardado." },
    ],
  },
  // ORGANIZADO
  {
    title: "Dívida não é sentença de morte",
    emoji: "🔓",
    color: "bg-warning/5 border-warning/20",
    level: "organizado",
    pages: [
      { title: "Introdução", content: "Estar endividado não significa estar condenado. Milhões de brasileiros têm dívidas e existe um caminho para sair dessa situação. O primeiro passo é parar de se culpar e começar a agir. Existem ferramentas, programas e estratégias que podem ajudar você a retomar o controle." },
      { title: "Explicação", content: "O Serasa Limpa Nome oferece descontos de até 99% em dívidas. Mutirões de renegociação organizados por bancos e Procons acontecem regularmente. Priorize dívidas com juros mais altos (cartão de crédito e cheque especial). Se possível, troque uma dívida cara por uma mais barata (empréstimo consignado, por exemplo). A bola de neve da dívida acontece quando os juros compostos trabalham contra você — por isso, quanto antes renegociar, melhor." },
      { title: "Dicas Práticas", content: "1️⃣ Liste TODAS as suas dívidas: valor, credor, taxa de juros.\n2️⃣ Acesse o Serasa Limpa Nome e verifique ofertas de renegociação.\n3️⃣ Priorize quitar a dívida com maior taxa de juros primeiro.\n4️⃣ Nunca faça uma dívida para pagar outra (exceto para trocar juros altos por baixos).\n5️⃣ Após quitar, use o valor da parcela para construir sua reserva." },
    ],
  },
  {
    title: "Compra por impulso: como parar",
    emoji: "🧠",
    color: "bg-accent/5 border-accent/20",
    level: "organizado",
    pages: [
      { title: "Introdução", content: "A compra por impulso é responsável por até 40% dos gastos desnecessários de uma família brasileira. Propagandas, promoções relâmpago e a facilidade do Pix fazem com que comprar seja mais fácil do que nunca. Mas aprender a controlar esse impulso pode mudar completamente sua vida financeira." },
      { title: "Explicação", content: "O impulso de comprar é uma resposta emocional, não racional. Quando você vê algo que deseja, seu cérebro libera dopamina — o hormônio do prazer. É a mesma química que causa vícios. Entender isso é fundamental: você não é fraco, seu cérebro está programado para isso. A boa notícia é que técnicas simples podem 'enganar' esse mecanismo. A regra dos 3 dias é a mais eficaz: espere 72 horas antes de qualquer compra não essencial. Em 80% dos casos, o desejo passa." },
      { title: "Dicas Práticas", content: "1️⃣ Regra dos 3 dias: viu algo? Espere 3 dias para decidir.\n2️⃣ Remova apps de compras do celular.\n3️⃣ Desative notificações de promoções.\n4️⃣ Antes de comprar, pergunte: 'Eu preciso ou eu quero?'\n5️⃣ Calcule quantas horas de trabalho aquele item representa." },
    ],
  },
  {
    title: "Pix parcelado e cartão: armadilhas",
    emoji: "⚠️",
    color: "bg-danger/5 border-danger/20",
    level: "organizado",
    pages: [
      { title: "Introdução", content: "O cartão de crédito e o Pix parcelado são ferramentas úteis quando usados com consciência. Mas para milhões de brasileiros, eles se tornaram armadilhas que levam ao endividamento. Os juros do rotativo do cartão de crédito são os mais altos do mercado, chegando a 400% ao ano." },
      { title: "Explicação", content: "O problema não é o cartão em si, mas a ilusão de que o parcelamento 'cabe no orçamento'. Quando você parcela uma compra, está comprometendo renda futura. Some todas as parcelas que você já paga hoje. Se esse total ultrapassar 30% da sua renda, você está em zona de perigo. O mínimo do cartão é outra armadilha: ao pagar apenas o mínimo, o restante entra no rotativo com juros abusivos. Uma dívida de R$ 1.000 pode virar R$ 4.000 em um ano." },
      { title: "Dicas Práticas", content: "1️⃣ Some TODAS as suas parcelas atuais. Esse é seu comprometimento real.\n2️⃣ Nunca pague apenas o mínimo do cartão — sempre pague o total.\n3️⃣ Se não tem dinheiro para comprar à vista, reconsidere a compra.\n4️⃣ Use o cartão como forma de pagamento, não como crédito.\n5️⃣ Limite o cartão: defina um teto mensal e não ultrapasse." },
    ],
  },
  // INVESTIDOR
  {
    title: "O que é Renda Fixa?",
    emoji: "📊",
    color: "bg-safe/5 border-safe/20",
    level: "investidor",
    pages: [
      { title: "Introdução", content: "Renda fixa é o tipo de investimento mais seguro e previsível do mercado. Diferente da renda variável (ações, criptomoedas), na renda fixa você sabe — ou tem uma boa previsão — de quanto vai receber de volta. É como emprestar dinheiro para alguém (banco, governo ou empresa) e receber juros por isso." },
      { title: "Explicação", content: "Existem três tipos principais de renda fixa:\n\n📌 Prefixada: você sabe exatamente quanto vai receber (ex: 12% ao ano).\n📌 Pós-fixada: o rendimento acompanha um índice, geralmente o CDI (ex: 100% do CDI).\n📌 IPCA+: protege contra inflação + taxa fixa (ex: IPCA + 6%).\n\nOs principais investimentos de renda fixa são: CDB, Tesouro Direto, LCI, LCA, Debêntures e CRI/CRA. Para quem está começando, CDB com liquidez diária e Tesouro Selic são as melhores opções por serem seguros e acessíveis." },
      { title: "Dicas Práticas", content: "1️⃣ Comece pelo CDB com liquidez diária — rende mais que a poupança.\n2️⃣ O Tesouro Selic é ideal para reserva de emergência.\n3️⃣ Invista valores pequenos primeiro para se acostumar.\n4️⃣ Compare taxas entre bancos e corretoras — elas variam muito.\n5️⃣ Lembre-se: renda fixa tem garantia do FGC até R$ 250 mil por instituição." },
    ],
  },
  {
    title: "CDB com Liquidez Diária",
    emoji: "🏦",
    color: "bg-primary/5 border-primary/20",
    level: "investidor",
    pages: [
      { title: "Introdução", content: "O CDB (Certificado de Depósito Bancário) com liquidez diária é considerado o melhor investimento para a reserva de emergência. Ele combina segurança, rendimento superior à poupança e disponibilidade imediata do dinheiro. Você pode resgatar a qualquer momento, sem perder o rendimento." },
      { title: "Explicação", content: "Quando você investe em um CDB, está emprestando dinheiro para um banco. Em troca, ele paga juros. O 'liquidez diária' significa que você pode resgatar seu dinheiro a qualquer dia útil. Procure CDBs que pagam pelo menos 100% do CDI. Em 2026, com a Selic em torno de 10% ao ano, isso significa rendimento aproximado de 10% ao ano — quase o dobro da poupança. O CDB tem proteção do FGC (Fundo Garantidor de Créditos) até R$ 250 mil, então seu dinheiro está seguro mesmo se o banco quebrar." },
      { title: "Dicas Práticas", content: "1️⃣ Abra conta em uma corretora gratuita (Nu Invest, Rico, XP).\n2️⃣ Procure CDBs que pagam 100% do CDI ou mais.\n3️⃣ Comece com qualquer valor — muitos CDBs aceitam a partir de R$ 1.\n4️⃣ Use para a reserva de emergência pela liquidez imediata.\n5️⃣ Compare: banco grande = menor rendimento, banco médio = maior rendimento." },
    ],
  },
  {
    title: "Como investir passo a passo",
    emoji: "🚀",
    color: "bg-accent/5 border-accent/20",
    level: "investidor",
    pages: [
      { title: "Introdução", content: "Investir não é coisa de rico. Hoje, com R$ 1 você já consegue fazer seu primeiro investimento. O mundo dos investimentos pode parecer intimidador no começo, cheio de termos técnicos e gráficos. Mas na prática, é muito mais simples do que parece." },
      { title: "Explicação", content: "O passo a passo é simples:\n\n1️⃣ Abra uma conta em uma corretora gratuita (Nu Invest, Rico, Clear, XP).\n2️⃣ Transfira dinheiro via Pix para sua conta na corretora.\n3️⃣ No app, vá em 'Renda Fixa' e escolha um CDB com liquidez diária.\n4️⃣ Digite o valor que deseja investir e confirme.\n5️⃣ Pronto! Seu dinheiro já está rendendo.\n\nA corretora é apenas uma 'ponte' entre você e os investimentos. Ela não fica com seu dinheiro — os títulos ficam registrados no seu CPF na B3 (bolsa de valores) ou no Tesouro Nacional." },
      { title: "Dicas Práticas", content: "1️⃣ Comece pela corretora do seu banco para facilitar.\n2️⃣ Faça um investimento teste de R$ 10 para entender o processo.\n3️⃣ Configure investimentos automáticos mensais.\n4️⃣ Não olhe seus investimentos todo dia — paciência é fundamental.\n5️⃣ Diversifique aos poucos: CDB + Tesouro Direto é uma boa combinação inicial." },
    ],
  },
  {
    title: "Tesouro Direto: investindo no governo",
    emoji: "🇧🇷",
    color: "bg-safe/5 border-safe/20",
    level: "investidor",
    pages: [
      { title: "Introdução", content: "O Tesouro Direto é o investimento mais seguro do Brasil. Quando você investe no Tesouro, está emprestando dinheiro para o governo federal. Em troca, o governo paga juros. É impossível perder dinheiro se mantiver até o vencimento." },
      { title: "Explicação", content: "Existem três tipos de títulos:\n\n📌 Tesouro Selic: rende de acordo com a taxa Selic. Ideal para reserva de emergência por ter liquidez diária.\n📌 Tesouro IPCA+: protege contra a inflação. Rende inflação + taxa fixa. Ideal para metas de longo prazo.\n📌 Tesouro Prefixado: taxa fixa definida no momento da compra. Bom quando os juros estão altos e devem cair.\n\nInvestimento mínimo a partir de R$ 30. Você pode comprar frações de um título." },
      { title: "Dicas Práticas", content: "1️⃣ Cadastre-se no site do Tesouro Direto (tesourodireto.com.br).\n2️⃣ Para emergências, use Tesouro Selic.\n3️⃣ Para aposentadoria, use Tesouro IPCA+ com vencimento longo.\n4️⃣ Evite vender antes do vencimento para não ter prejuízo.\n5️⃣ Reinvista os rendimentos para aproveitar os juros compostos." },
    ],
  },
  // INDEPENDENTE
  {
    title: "LCI e LCA: renda fixa sem imposto",
    emoji: "🌾",
    color: "bg-warning/5 border-warning/20",
    level: "independente",
    pages: [
      { title: "Introdução", content: "LCI (Letra de Crédito Imobiliário) e LCA (Letra de Crédito do Agronegócio) são investimentos de renda fixa com uma grande vantagem: são ISENTOS de Imposto de Renda para pessoa física. Isso significa que todo o rendimento é líquido — vai direto para o seu bolso." },
      { title: "Explicação", content: "Quando você investe em LCI, o banco usa seu dinheiro para financiar o setor imobiliário. Na LCA, para o agronegócio. Em troca, paga juros. A isenção de IR faz com que um LCI/LCA que paga 90% do CDI renda mais que um CDB que paga 100% do CDI (após impostos). A desvantagem: geralmente não têm liquidez diária — o prazo mínimo costuma ser de 90 dias. São protegidos pelo FGC até R$ 250 mil." },
      { title: "Dicas Práticas", content: "1️⃣ Compare o rendimento líquido (LCI/LCA) com o bruto (CDB) antes de escolher.\n2️⃣ Use LCI/LCA para dinheiro que não vai precisar no curto prazo.\n3️⃣ Procure LCIs/LCAs que pagam pelo menos 90% do CDI.\n4️⃣ Verifique o prazo de carência antes de investir.\n5️⃣ Combine com CDB líquido: emergências no CDB, médio prazo no LCI/LCA." },
    ],
  },
  {
    title: "Poupança x CDB x Tesouro: comparativo",
    emoji: "📈",
    color: "bg-danger/5 border-danger/20",
    level: "independente",
    pages: [
      { title: "Introdução", content: "A poupança ainda é o investimento mais popular do Brasil, mas é o que MENOS rende. Muitos brasileiros deixam de ganhar dinheiro por falta de informação. Entender as diferenças entre poupança, CDB e Tesouro Direto pode fazer você ganhar centenas de reais a mais por ano." },
      { title: "Explicação", content: "Comparando R$ 1.000 investidos por 1 ano:\n\n📌 Poupança: R$ 1.061 (rendimento ~6,17% ao ano)\n📌 CDB 100% CDI: R$ 1.086 (~8,7% líquido após IR)\n📌 Tesouro Selic: R$ 1.085 (~8,6% líquido após IR)\n📌 LCI 90% CDI: R$ 1.090 (~9% isento de IR)\n\nA poupança SEMPRE rende menos. A diferença parece pequena com R$ 1.000, mas com R$ 10.000 são R$ 250+ a mais por ano. Em 10 anos, a diferença pode passar de R$ 5.000." },
      { title: "Dicas Práticas", content: "1️⃣ Tire seu dinheiro da poupança HOJE — qualquer CDB rende mais.\n2️⃣ Use a planilha: multiplique seu saldo pela diferença de rendimento.\n3️⃣ Para emergências: CDB liquidez diária ou Tesouro Selic.\n4️⃣ Para médio prazo: LCI/LCA ou CDB de prazo maior.\n5️⃣ Diversifique entre pelo menos 2 tipos de investimento." },
    ],
  },
  {
    title: "Quanto investir por mês?",
    emoji: "💰",
    color: "bg-primary/5 border-primary/20",
    level: "independente",
    pages: [
      { title: "Introdução", content: "A pergunta mais comum de quem começa a investir é: 'Quanto eu preciso investir por mês?'. A resposta pode surpreender: comece com o que puder. R$ 10, R$ 30, R$ 50. O mais importante não é o valor, é a CONSISTÊNCIA." },
      { title: "Explicação", content: "A regra 50-30-20 é um bom ponto de partida:\n\n📌 50% da renda para necessidades (moradia, alimentação, transporte)\n📌 30% para desejos (lazer, restaurantes, compras)\n📌 20% para investimentos e quitação de dívidas\n\nSe 20% parece muito, comece com 5% ou 10% e aumente gradualmente. O poder dos juros compostos significa que investir R$ 100/mês durante 20 anos a 10% ao ano resulta em R$ 76.000 — sendo que você investiu apenas R$ 24.000. Os outros R$ 52.000 são juros!" },
      { title: "Dicas Práticas", content: "1️⃣ Defina um percentual fixo da renda para investir (comece com 5%).\n2️⃣ Invista ANTES de gastar — no dia do pagamento.\n3️⃣ Configure investimentos automáticos.\n4️⃣ Aumente o percentual a cada aumento de salário.\n5️⃣ Trate o investimento como uma 'conta obrigatória', não como sobra." },
    ],
  },
  {
    title: "Erros comuns de quem começa",
    emoji: "🚫",
    color: "bg-danger/5 border-danger/20",
    level: "independente",
    pages: [
      { title: "Introdução", content: "Começar a investir é emocionante, mas existem armadilhas que podem custar caro. Conhecer os erros mais comuns é a melhor forma de evitá-los. Ninguém nasce sabendo investir, mas aprender com os erros dos outros é muito mais barato." },
      { title: "Explicação", content: "Os erros mais comuns são:\n\n❌ Investir sem ter reserva de emergência — se precisar resgatar, pode ter prejuízo.\n❌ Colocar tudo em um único investimento — se ele vai mal, você perde tudo.\n❌ Resgatar antes do prazo — perde rendimento e paga mais imposto.\n❌ Não pesquisar taxas — algumas corretoras cobram taxas abusivas.\n❌ Acreditar em promessas de retorno alto — se parece bom demais, é golpe.\n❌ Investir em algo que não entende — nunca invista no que não conhece.\n❌ Comparar com os outros — cada pessoa tem uma realidade diferente." },
      { title: "Dicas Práticas", content: "1️⃣ Monte sua reserva de emergência ANTES de pensar em investimentos.\n2️⃣ Diversifique: nunca coloque todos os ovos na mesma cesta.\n3️⃣ Respeite prazos: não resgate investimentos antes do vencimento.\n4️⃣ Use corretoras com taxa zero — elas existem.\n5️⃣ Desconfie de promessas de rendimento acima de 2% ao mês.\n6️⃣ Estude antes de investir: leia, assista vídeos, use o Futuro Real." },
    ],
  },
];

const Educacao = () => {
  const { isPremium } = useAuth();
  const navigate = useNavigate();
  const [openArticle, setOpenArticle] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

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

  if (openArticle !== null) {
    const article = articles[openArticle];
    const page = article.pages[currentPage];
    const pageLabels = ["📖 Introdução", "📚 Explicação", "💡 Dicas Práticas"];

    return (
      <AppLayout>
        <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
          <button onClick={() => { setOpenArticle(null); setCurrentPage(0); }} className="text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{article.emoji}</span>
            <h1 className="text-xl font-extrabold text-foreground">{article.title}</h1>
          </div>

          {/* Page indicators */}
          <div className="flex gap-2 mb-4">
            {article.pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`flex-1 h-1.5 rounded-full transition-colors ${i === currentPage ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          <div className="bg-card rounded-2xl border shadow-sm p-5 animate-fade-up">
            <span className="text-xs font-bold text-primary mb-2 block">{pageLabels[currentPage] || page.title}</span>
            <h2 className="text-lg font-bold text-foreground mb-3">{page.title}</h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{page.content}</p>
          </div>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            {currentPage < article.pages.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                className="flex items-center gap-1"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setOpenArticle(null); setCurrentPage(0); }}
                className="text-brand-green border-brand-green"
              >
                ✓ Concluído
              </Button>
            )}
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
          const levelArticles = articles.map((a, i) => ({ ...a, index: i })).filter(a => a.level === level);
          if (levelArticles.length === 0) return null;

          return (
            <div key={level} className="mb-6">
              <div className={`rounded-xl p-3 mb-3 border ${lvl.color}`}>
                <span className="text-sm font-bold">{lvl.label}</span>
                <p className="text-xs mt-1 opacity-80">{lvl.desc}</p>
              </div>

              <div className="space-y-3">
                {levelArticles.map((article) => (
                  <button
                    key={article.index}
                    onClick={() => { setOpenArticle(article.index); setCurrentPage(0); }}
                    className="w-full text-left bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 p-4">
                      <span className="text-2xl">{article.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-foreground block">{article.title}</span>
                        <span className="text-xs text-muted-foreground">{article.pages.length} telas • Toque para ler</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
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
