import { useState, useEffect, useRef } from "react";
import { BookOpen, Lock, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData } from "@/hooks/useFinancialData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppLayout from "@/components/AppLayout";
import confetti from "canvas-confetti";
import { generateCertificatePDF } from "@/lib/certificateGenerator";

const levelInfo = {
  iniciante: { label: "🌱 Iniciante", color: "bg-brand-blue/10 text-brand-blue border-brand-blue/20", completedColor: "bg-safe/10 text-safe border-safe/20", desc: "Conceitos básicos para quem está começando a organizar as finanças." },
  organizado: { label: "📋 Organizado", color: "bg-brand-green/10 text-brand-green border-brand-green/20", completedColor: "bg-safe/10 text-safe border-safe/20", desc: "Estratégias para planejar melhor e cortar desperdícios." },
  investidor: { label: "📈 Investidor", color: "bg-brand-gold/10 text-brand-gold border-brand-gold/20", completedColor: "bg-safe/10 text-safe border-safe/20", desc: "Aprenda a fazer o dinheiro trabalhar por você." },
  independente: { label: "🏆 Independente", color: "bg-accent/10 text-accent border-accent/20", completedColor: "bg-safe/10 text-safe border-safe/20", desc: "Conhecimento avançado para liberdade financeira." },
};

interface ArticlePage {
  title: string;
  content: string;
}

interface Article {
  id: string;
  title: string;
  emoji: string;
  color: string;
  level: "iniciante" | "organizado" | "investidor" | "independente";
  pages: ArticlePage[];
}

const articles: Article[] = [
  // INICIANTE (10 topics)
  {
    id: "ini_1", title: "Por que o dinheiro acaba antes do mês?", emoji: "💸", color: "bg-danger/5 border-danger/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "A maioria dos brasileiros sente que o dinheiro 'desaparece'. Você recebe o salário e, em poucos dias, já não sabe onde foi parar. Isso acontece porque não temos o hábito de acompanhar nossos gastos." },
      { title: "Explicação", content: "O problema não é necessariamente ganhar pouco, mas sim não ter visibilidade do que entra e do que sai. Quando você não anota seus gastos, perde o controle. Estudos mostram que pessoas que anotam suas despesas economizam em média 15% a mais por mês." },
      { title: "Dicas Práticas", content: "1️⃣ Anote TODOS os gastos por uma semana completa.\n2️⃣ Use o Futuro Real para categorizar seus gastos automaticamente.\n3️⃣ Some todos os 'gastos pequenos'.\n4️⃣ Identifique os 3 maiores 'ralos' de dinheiro.\n5️⃣ Estabeleça um valor máximo diário para gastos variáveis." },
    ],
  },
  {
    id: "ini_2", title: "Como sobreviver com salário mínimo", emoji: "💪", color: "bg-primary/5 border-primary/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "Viver com salário mínimo no Brasil é um desafio diário enfrentado por milhões de famílias. Parece impossível guardar dinheiro quando mal dá para pagar as contas. Mas com planejamento e disciplina, é possível começar a construir uma base financeira mais sólida." },
      { title: "Explicação", content: "A chave está na priorização radical. Com renda limitada, cada real conta. Divida seus gastos em ordem de importância: moradia, alimentação e transporte são inegociáveis. Aproveite programas do governo como Bolsa Família, Tarifa Social de Energia, CadÚnico e farmácias populares." },
      { title: "Dicas Práticas", content: "1️⃣ Faça uma lista de compras semanal e NÃO saia dela.\n2️⃣ Compre frutas e verduras em feiras livres no final do dia.\n3️⃣ Troque marcas caras por genéricas.\n4️⃣ Cadastre-se no CadÚnico para acessar benefícios do governo.\n5️⃣ Separe pelo menos R$ 10 por semana." },
    ],
  },
  {
    id: "ini_3", title: "Reserva de emergência na vida real", emoji: "🛡️", color: "bg-safe/5 border-safe/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "Você já ouviu que precisa ter 6 meses de gastos guardados. Parece impossível, certo? A verdade é que a reserva de emergência não precisa começar grande. Ela precisa começar." },
      { title: "Explicação", content: "A reserva de emergência é o dinheiro que você guarda para situações inesperadas: uma doença, um conserto urgente, a perda do emprego. Sem ela, qualquer imprevisto vira uma dívida. O ideal é ter de 3 a 6 meses de gastos essenciais guardados." },
      { title: "Dicas Práticas", content: "1️⃣ Comece com R$ 50 por mês — ou R$ 12,50 por semana.\n2️⃣ Abra uma conta separada APENAS para a reserva.\n3️⃣ Configure transferência automática no dia do pagamento.\n4️⃣ NÃO use esse dinheiro para nada que não seja emergência real.\n5️⃣ A cada meta atingida, comemore e aumente o valor guardado." },
    ],
  },
  {
    id: "ini_4", title: "O que são juros e como eles te afetam", emoji: "📐", color: "bg-warning/5 border-warning/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "Juros são o 'preço do dinheiro'. Quando você empresta dinheiro (investimento), recebe juros. Quando pede emprestado (dívida), paga juros. Entender juros é fundamental para tomar decisões financeiras inteligentes." },
      { title: "Explicação", content: "Existem juros simples e compostos. Nos simples, o cálculo é sempre sobre o valor inicial. Nos compostos, os juros incidem sobre juros anteriores — é o famoso 'juros sobre juros'. Cartão de crédito cobra juros compostos de até 400% ao ano. Já investimentos pagam juros compostos a seu favor." },
      { title: "Dicas Práticas", content: "1️⃣ Nunca pague apenas o mínimo do cartão — os juros são absurdos.\n2️⃣ Entenda a taxa antes de fazer qualquer empréstimo.\n3️⃣ Use juros compostos a seu favor: invista cedo e com consistência.\n4️⃣ Compare o CET (Custo Efetivo Total) antes de contratar crédito.\n5️⃣ Fuja do cheque especial — os juros são dos mais altos do mercado." },
    ],
  },
  {
    id: "ini_5", title: "Como fazer um orçamento simples", emoji: "📝", color: "bg-primary/5 border-primary/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "Um orçamento é simplesmente um plano para o seu dinheiro. Sem ele, você gasta sem saber onde o dinheiro vai. Com ele, você decide para onde cada real vai antes de gastá-lo." },
      { title: "Explicação", content: "O método mais simples é o 50-30-20: 50% para necessidades (moradia, alimentação, transporte), 30% para desejos (lazer, restaurantes) e 20% para poupança e quitação de dívidas. Se sua renda é R$ 2.000: R$ 1.000 para necessidades, R$ 600 para desejos, R$ 400 para poupar." },
      { title: "Dicas Práticas", content: "1️⃣ Liste toda sua renda mensal.\n2️⃣ Liste todos os gastos fixos (aluguel, luz, água).\n3️⃣ Defina um limite para gastos variáveis.\n4️⃣ Use o Futuro Real para acompanhar automaticamente.\n5️⃣ Revise seu orçamento todo mês e ajuste conforme necessário." },
    ],
  },
  {
    id: "ini_6", title: "Diferença entre querer e precisar", emoji: "🤔", color: "bg-accent/5 border-accent/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "Saber a diferença entre necessidade e desejo é o primeiro passo para controlar seus gastos. Muitas vezes confundimos vontade momentânea com necessidade real, e isso drena nosso dinheiro rapidamente." },
      { title: "Explicação", content: "Necessidades são gastos essenciais para sobreviver: alimentação, moradia, saúde, transporte para o trabalho. Desejos são coisas que melhoram sua qualidade de vida mas não são essenciais: roupas de marca, delivery, streaming. A chave não é eliminar desejos, mas priorizá-los conscientemente." },
      { title: "Dicas Práticas", content: "1️⃣ Antes de comprar, pergunte: 'Eu PRECISO ou eu QUERO isso?'\n2️⃣ Espere 24h antes de compras não essenciais.\n3️⃣ Liste 5 coisas que você comprou e se arrependeu.\n4️⃣ Defina um 'fundo de desejos' mensal com valor limitado.\n5️⃣ Comemore pequenas vitórias quando resistir a uma compra por impulso." },
    ],
  },
  {
    id: "ini_7", title: "Como evitar o cheque especial", emoji: "🚫", color: "bg-danger/5 border-danger/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "O cheque especial é uma das maiores armadilhas financeiras do Brasil. Com juros que podem ultrapassar 300% ao ano, ele transforma pequenos déficits em grandes dívidas rapidamente." },
      { title: "Explicação", content: "O cheque especial funciona como um empréstimo automático: quando seu saldo fica negativo, o banco 'empresta' dinheiro automaticamente. O problema é que os juros começam a correr imediatamente, e são altíssimos. Muitas pessoas nem percebem que estão usando o cheque especial até a fatura chegar." },
      { title: "Dicas Práticas", content: "1️⃣ Peça ao banco para reduzir ou cancelar seu limite de cheque especial.\n2️⃣ Configure alertas de saldo baixo no app do banco.\n3️⃣ Mantenha uma 'gordura' de R$ 100 na conta para imprevistos.\n4️⃣ Se já está usando, negocie com o banco uma taxa menor.\n5️⃣ Troque a dívida do cheque especial por um empréstimo pessoal com juros menores." },
    ],
  },
  {
    id: "ini_8", title: "Metas financeiras: como definir as suas", emoji: "🎯", color: "bg-safe/5 border-safe/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "Ter metas financeiras claras é como ter um GPS para seu dinheiro. Sem destino definido, qualquer caminho serve — e geralmente o caminho é gastar tudo. Com metas, cada real tem um propósito." },
      { title: "Explicação", content: "Use o método SMART: Específica (o que exatamente?), Mensurável (quanto?), Atingível (é realista?), Relevante (importa para você?) e Temporal (até quando?). Em vez de 'quero economizar', defina 'quero juntar R$ 1.000 em 6 meses para minha reserva de emergência'." },
      { title: "Dicas Práticas", content: "1️⃣ Defina 3 metas: curto (3 meses), médio (1 ano) e longo prazo (5+ anos).\n2️⃣ Escreva suas metas e coloque em lugar visível.\n3️⃣ Divida metas grandes em etapas menores e celebráveis.\n4️⃣ Use as Caixinhas do Futuro Real para separar dinheiro por meta.\n5️⃣ Revise suas metas a cada 3 meses e ajuste se necessário." },
    ],
  },
  {
    id: "ini_9", title: "Como conversar sobre dinheiro em família", emoji: "👨‍👩‍👧‍👦", color: "bg-primary/5 border-primary/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "Dinheiro é um dos temas que mais causa conflitos em famílias e relacionamentos. Mas evitar o assunto só piora a situação. Conversas abertas sobre finanças são fundamentais para o bem-estar de todos." },
      { title: "Explicação", content: "A falta de comunicação financeira leva a dívidas escondidas, gastos não planejados e frustrações. Casais que conversam sobre dinheiro regularmente têm menos conflitos e mais estabilidade financeira. Com filhos, ensinar sobre dinheiro desde cedo cria adultos mais responsáveis financeiramente." },
      { title: "Dicas Práticas", content: "1️⃣ Agende uma 'reunião financeira' semanal com seu parceiro/família.\n2️⃣ Compartilhe todas as dívidas e receitas abertamente.\n3️⃣ Definam juntos as prioridades de gastos.\n4️⃣ Dê mesada com propósito educativo para os filhos.\n5️⃣ Celebrem juntos quando atingirem uma meta financeira." },
    ],
  },
  {
    id: "ini_10", title: "Golpes financeiros: como se proteger", emoji: "🔒", color: "bg-danger/5 border-danger/20", level: "iniciante",
    pages: [
      { title: "Introdução", content: "Golpes financeiros estão cada vez mais sofisticados no Brasil. De pirâmides financeiras a phishing por WhatsApp, milhões de brasileiros perdem dinheiro todos os anos para golpistas. Conhecimento é sua melhor proteção." },
      { title: "Explicação", content: "Os golpes mais comuns incluem: pirâmides financeiras (prometem retornos impossíveis), phishing (links falsos por e-mail/WhatsApp), falso atendente de banco (ligam pedindo dados), boletos falsos e golpes do Pix. A regra de ouro: se parece bom demais para ser verdade, provavelmente é golpe." },
      { title: "Dicas Práticas", content: "1️⃣ Nunca compartilhe senhas ou códigos de verificação com ninguém.\n2️⃣ Desconfie de retornos acima de 2% ao mês — é golpe.\n3️⃣ Verifique se a empresa tem registro na CVM ou Banco Central.\n4️⃣ Não clique em links suspeitos no WhatsApp ou e-mail.\n5️⃣ Ative a verificação em duas etapas em todos os apps financeiros." },
    ],
  },
  // ORGANIZADO (10 topics)
  {
    id: "org_1", title: "Dívida não é sentença de morte", emoji: "🔓", color: "bg-warning/5 border-warning/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "Estar endividado não significa estar condenado. Milhões de brasileiros têm dívidas e existe um caminho para sair dessa situação. O primeiro passo é parar de se culpar e começar a agir." },
      { title: "Explicação", content: "O Serasa Limpa Nome oferece descontos de até 99% em dívidas. Mutirões de renegociação acontecem regularmente. Priorize dívidas com juros mais altos (cartão de crédito e cheque especial). Se possível, troque uma dívida cara por uma mais barata (empréstimo consignado, por exemplo)." },
      { title: "Dicas Práticas", content: "1️⃣ Liste TODAS as suas dívidas: valor, credor, taxa de juros.\n2️⃣ Acesse o Serasa Limpa Nome e verifique ofertas de renegociação.\n3️⃣ Priorize quitar a dívida com maior taxa de juros primeiro.\n4️⃣ Nunca faça uma dívida para pagar outra (exceto trocar juros altos por baixos).\n5️⃣ Após quitar, use o valor da parcela para construir sua reserva." },
    ],
  },
  {
    id: "org_2", title: "Compra por impulso: como parar", emoji: "🧠", color: "bg-accent/5 border-accent/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "A compra por impulso é responsável por até 40% dos gastos desnecessários. Propagandas, promoções relâmpago e a facilidade do Pix fazem com que comprar seja mais fácil do que nunca." },
      { title: "Explicação", content: "O impulso de comprar é uma resposta emocional, não racional. Quando você vê algo que deseja, seu cérebro libera dopamina. A regra dos 3 dias é a mais eficaz: espere 72 horas antes de qualquer compra não essencial. Em 80% dos casos, o desejo passa." },
      { title: "Dicas Práticas", content: "1️⃣ Regra dos 3 dias: viu algo? Espere 3 dias para decidir.\n2️⃣ Remova apps de compras do celular.\n3️⃣ Desative notificações de promoções.\n4️⃣ Antes de comprar, pergunte: 'Eu preciso ou eu quero?'\n5️⃣ Calcule quantas horas de trabalho aquele item representa." },
    ],
  },
  {
    id: "org_3", title: "Pix parcelado e cartão: armadilhas", emoji: "⚠️", color: "bg-danger/5 border-danger/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "O cartão de crédito e o Pix parcelado são ferramentas úteis quando usados com consciência. Mas para milhões de brasileiros, eles se tornaram armadilhas que levam ao endividamento." },
      { title: "Explicação", content: "O problema não é o cartão em si, mas a ilusão de que o parcelamento 'cabe no orçamento'. Quando você parcela uma compra, está comprometendo renda futura. Some todas as parcelas que você já paga hoje. Se esse total ultrapassar 30% da sua renda, você está em zona de perigo." },
      { title: "Dicas Práticas", content: "1️⃣ Some TODAS as suas parcelas atuais.\n2️⃣ Nunca pague apenas o mínimo do cartão — sempre pague o total.\n3️⃣ Se não tem dinheiro para comprar à vista, reconsidere a compra.\n4️⃣ Use o cartão como forma de pagamento, não como crédito.\n5️⃣ Limite o cartão: defina um teto mensal e não ultrapasse." },
    ],
  },
  {
    id: "org_4", title: "Método bola de neve para dívidas", emoji: "❄️", color: "bg-brand-blue/5 border-brand-blue/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "O método bola de neve é uma das estratégias mais eficazes para sair das dívidas. Criado pelo especialista Dave Ramsey, ele foca na motivação psicológica para manter você engajado na quitação." },
      { title: "Explicação", content: "Funciona assim: liste todas as dívidas da menor para a maior. Pague o mínimo em todas, exceto na menor — nela, coloque todo o dinheiro extra possível. Quando quitar a menor, pegue o valor que pagava nela e some ao pagamento da próxima. Isso cria um 'efeito bola de neve' que acelera a quitação." },
      { title: "Dicas Práticas", content: "1️⃣ Liste todas as dívidas do menor ao maior valor.\n2️⃣ Pague o mínimo em todas, exceto na menor.\n3️⃣ Coloque todo dinheiro extra na menor dívida.\n4️⃣ Quando quitar uma, some o valor à próxima.\n5️⃣ Celebre cada dívida quitada — a motivação é parte do método." },
    ],
  },
  {
    id: "org_5", title: "Como economizar no supermercado", emoji: "🛒", color: "bg-safe/5 border-safe/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "Alimentação é um dos maiores gastos de qualquer família brasileira. Pequenas mudanças na forma como você compra no supermercado podem gerar economias de 20% a 30% por mês." },
      { title: "Explicação", content: "Os supermercados são projetados para te fazer gastar mais: produtos caros na altura dos olhos, promoções de 'leve 3 pague 2' que você não precisa, e o cheiro de pão fresquinho na padaria. Ir com fome ao supermercado aumenta seus gastos em até 30%." },
      { title: "Dicas Práticas", content: "1️⃣ SEMPRE faça lista antes de ir e não saia dela.\n2️⃣ Nunca vá com fome ao supermercado.\n3️⃣ Compare preço por kg/litro, não por embalagem.\n4️⃣ Compre itens básicos no atacado.\n5️⃣ Aproveite apps de cashback como Méliuz e Picpay." },
    ],
  },
  {
    id: "org_6", title: "Contas fixas: como reduzir", emoji: "💡", color: "bg-warning/5 border-warning/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "Contas fixas como energia, água, telefone e internet parecem imutáveis, mas na verdade existem muitas formas de reduzi-las. Uma revisão cuidadosa pode economizar centenas de reais por mês." },
      { title: "Explicação", content: "Muitas pessoas pagam por serviços que não usam ou por planos maiores do que precisam. Revisar seus planos de telefone, internet e streaming pode revelar economias significativas. Além disso, hábitos simples de consumo de energia e água fazem grande diferença no fim do mês." },
      { title: "Dicas Práticas", content: "1️⃣ Revise seus planos de celular e internet — você pode estar pagando mais do que precisa.\n2️⃣ Cancele streamings que não usa (quantos você tem?).\n3️⃣ Troque lâmpadas por LED — economia de até 80%.\n4️⃣ Desligue aparelhos da tomada quando não estiver usando.\n5️⃣ Negocie com prestadores de serviço — peça desconto ou ameace cancelar." },
    ],
  },
  {
    id: "org_7", title: "Planejamento financeiro mensal", emoji: "📅", color: "bg-primary/5 border-primary/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "O planejamento financeiro mensal é a ferramenta mais poderosa para quem quer ter controle do dinheiro. Dedicar 30 minutos por mês para planejar pode mudar completamente sua relação com as finanças." },
      { title: "Explicação", content: "No início de cada mês, faça uma reunião financeira consigo mesmo (ou com a família). Revise o mês anterior: onde gastou mais? Onde pode cortar? Depois, planeje o mês atual: quais contas vão vencer? Tem algum gasto extra previsto? Defina quanto quer guardar." },
      { title: "Dicas Práticas", content: "1️⃣ Reserve 30 minutos no dia 1º de cada mês para planejar.\n2️⃣ Revise todos os gastos do mês anterior no Futuro Real.\n3️⃣ Anote datas de vencimento de todas as contas.\n4️⃣ Defina quanto vai investir/guardar antes de gastar.\n5️⃣ Ajuste o orçamento quando receber renda extra (13º, bônus)." },
    ],
  },
  {
    id: "org_8", title: "Renda extra: ideias práticas", emoji: "💼", color: "bg-accent/5 border-accent/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "Às vezes, cortar gastos não é suficiente. Aumentar a renda pode ser a solução para sair das dívidas mais rápido ou atingir suas metas financeiras. E existem muitas formas de gerar renda extra sem precisar de grande investimento inicial." },
      { title: "Explicação", content: "A economia digital abriu possibilidades enormes para renda extra. Desde freelancer em plataformas como Workana e 99Freelas, até vender produtos usados no OLX e Enjoei, passar comida no iFood, fazer entregas por app ou oferecer serviços como aulas particulares e consertos." },
      { title: "Dicas Práticas", content: "1️⃣ Liste suas habilidades: o que você faz bem que outros pagariam?\n2️⃣ Venda o que não usa mais em casa (roupas, eletrônicos, móveis).\n3️⃣ Ofereça serviços no seu bairro (faxina, jardinagem, aulas).\n4️⃣ Cadastre-se em plataformas de freelancer.\n5️⃣ Use a renda extra EXCLUSIVAMENTE para dívidas ou investimentos." },
    ],
  },
  {
    id: "org_9", title: "Como negociar contas e dívidas", emoji: "🤝", color: "bg-brand-green/5 border-brand-green/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "Negociar é uma habilidade que pode economizar milhares de reais. Desde o aluguel até dívidas com bancos, quase tudo é negociável. O segredo é saber quando e como pedir." },
      { title: "Explicação", content: "Empresas preferem receber com desconto do que não receber nada. Bancos, operadoras de telefone e até proprietários de imóveis estão abertos a negociação. O melhor momento para negociar é quando você tem alternativas (outro banco, outro plano) ou quando a empresa tem medo de perder o cliente." },
      { title: "Dicas Práticas", content: "1️⃣ Pesquise alternativas antes de negociar — tenha argumentos.\n2️⃣ Ligue para a retenção, não para o SAC comum.\n3️⃣ Seja educado mas firme — nunca aceite a primeira oferta.\n4️⃣ Diga que viu um preço melhor no concorrente.\n5️⃣ Negocie parcelamento de dívidas diretamente com o credor." },
    ],
  },
  {
    id: "org_10", title: "Automação financeira", emoji: "⚙️", color: "bg-brand-blue/5 border-brand-blue/20", level: "organizado",
    pages: [
      { title: "Introdução", content: "Automatizar suas finanças significa configurar sistemas que trabalham para você sem esforço diário. É a forma mais eficiente de garantir que você pague contas em dia, invista regularmente e não gaste mais do que deve." },
      { title: "Explicação", content: "A automação financeira funciona em três pilares: 1) Débito automático para contas fixas (evita atrasos e multas), 2) Transferência automática para investimentos no dia do pagamento, 3) Limites de gastos configurados no app do banco. Quando o dinheiro é separado automaticamente, você não precisa usar força de vontade." },
      { title: "Dicas Práticas", content: "1️⃣ Configure débito automático para todas as contas fixas.\n2️⃣ Programe transferência automática para investimentos no dia do salário.\n3️⃣ Use cartões com limite definido para gastos variáveis.\n4️⃣ Ative alertas de gastos no app do banco.\n5️⃣ Revise suas automações a cada 3 meses para ajustar valores." },
    ],
  },
  // INVESTIDOR (10 topics)
  {
    id: "inv_1", title: "O que é Renda Fixa?", emoji: "📊", color: "bg-safe/5 border-safe/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "Renda fixa é o tipo de investimento mais seguro e previsível do mercado. Diferente da renda variável, na renda fixa você sabe — ou tem uma boa previsão — de quanto vai receber de volta." },
      { title: "Explicação", content: "Existem três tipos principais:\n📌 Prefixada: você sabe exatamente quanto vai receber (ex: 12% ao ano).\n📌 Pós-fixada: o rendimento acompanha um índice, geralmente o CDI.\n📌 IPCA+: protege contra inflação + taxa fixa.\n\nOs principais investimentos são: CDB, Tesouro Direto, LCI, LCA e Debêntures." },
      { title: "Dicas Práticas", content: "1️⃣ Comece pelo CDB com liquidez diária — rende mais que a poupança.\n2️⃣ O Tesouro Selic é ideal para reserva de emergência.\n3️⃣ Invista valores pequenos primeiro para se acostumar.\n4️⃣ Compare taxas entre bancos e corretoras.\n5️⃣ Renda fixa tem garantia do FGC até R$ 250 mil por instituição." },
    ],
  },
  {
    id: "inv_2", title: "CDB com Liquidez Diária", emoji: "🏦", color: "bg-primary/5 border-primary/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "O CDB com liquidez diária é considerado o melhor investimento para a reserva de emergência. Ele combina segurança, rendimento superior à poupança e disponibilidade imediata do dinheiro." },
      { title: "Explicação", content: "Quando você investe em um CDB, está emprestando dinheiro para um banco. O 'liquidez diária' significa que você pode resgatar a qualquer dia útil. Procure CDBs que pagam pelo menos 100% do CDI. O CDB tem proteção do FGC até R$ 250 mil." },
      { title: "Dicas Práticas", content: "1️⃣ Abra conta em uma corretora gratuita (Nu Invest, Rico, XP).\n2️⃣ Procure CDBs que pagam 100% do CDI ou mais.\n3️⃣ Comece com qualquer valor — muitos aceitam a partir de R$ 1.\n4️⃣ Use para a reserva de emergência pela liquidez imediata.\n5️⃣ Compare: banco grande = menor rendimento, banco médio = maior rendimento." },
    ],
  },
  {
    id: "inv_3", title: "Como investir passo a passo", emoji: "🚀", color: "bg-accent/5 border-accent/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "Investir não é coisa de rico. Hoje, com R$ 1 você já consegue fazer seu primeiro investimento. O mundo dos investimentos pode parecer intimidador, mas na prática é muito mais simples do que parece." },
      { title: "Explicação", content: "O passo a passo:\n1️⃣ Abra conta em uma corretora gratuita.\n2️⃣ Transfira dinheiro via Pix.\n3️⃣ Vá em 'Renda Fixa' e escolha um CDB com liquidez diária.\n4️⃣ Digite o valor e confirme.\n5️⃣ Pronto! Seu dinheiro já está rendendo.\n\nA corretora é apenas uma 'ponte' — os títulos ficam no seu CPF." },
      { title: "Dicas Práticas", content: "1️⃣ Comece pela corretora do seu banco para facilitar.\n2️⃣ Faça um investimento teste de R$ 10.\n3️⃣ Configure investimentos automáticos mensais.\n4️⃣ Não olhe seus investimentos todo dia.\n5️⃣ Diversifique: CDB + Tesouro Direto é uma boa combinação inicial." },
    ],
  },
  {
    id: "inv_4", title: "Tesouro Direto: investindo no governo", emoji: "🇧🇷", color: "bg-safe/5 border-safe/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "O Tesouro Direto é o investimento mais seguro do Brasil. Quando você investe no Tesouro, está emprestando dinheiro para o governo federal. É impossível perder dinheiro se mantiver até o vencimento." },
      { title: "Explicação", content: "Existem três tipos de títulos:\n📌 Tesouro Selic: rende de acordo com a taxa Selic. Ideal para reserva de emergência.\n📌 Tesouro IPCA+: protege contra a inflação. Ideal para metas de longo prazo.\n📌 Tesouro Prefixado: taxa fixa definida na compra.\n\nInvestimento mínimo a partir de R$ 30." },
      { title: "Dicas Práticas", content: "1️⃣ Cadastre-se no site do Tesouro Direto.\n2️⃣ Para emergências, use Tesouro Selic.\n3️⃣ Para aposentadoria, use Tesouro IPCA+ com vencimento longo.\n4️⃣ Evite vender antes do vencimento.\n5️⃣ Reinvista os rendimentos para aproveitar os juros compostos." },
    ],
  },
  {
    id: "inv_5", title: "Diversificação: não coloque tudo em um cesto", emoji: "🧺", color: "bg-warning/5 border-warning/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "Diversificação é a regra número 1 dos investimentos. Significa distribuir seu dinheiro em diferentes tipos de investimento para reduzir o risco. Se um vai mal, os outros compensam." },
      { title: "Explicação", content: "Uma carteira diversificada para iniciantes pode ser: 60% em renda fixa (CDB, Tesouro), 20% em fundos imobiliários (FIIs) e 20% em ações de empresas sólidas. Conforme você ganha experiência, pode ajustar as proporções. O importante é nunca colocar todo o dinheiro em um único investimento." },
      { title: "Dicas Práticas", content: "1️⃣ Comece com 100% em renda fixa até ter experiência.\n2️⃣ Depois, inclua fundos imobiliários (FIIs) aos poucos.\n3️⃣ Nunca invista mais de 10% em um único ativo.\n4️⃣ Diversifique entre emissores diferentes (não só um banco).\n5️⃣ Rebalanceie sua carteira a cada 6 meses." },
    ],
  },
  {
    id: "inv_6", title: "Fundos Imobiliários (FIIs)", emoji: "🏢", color: "bg-brand-gold/5 border-brand-gold/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "Fundos Imobiliários permitem que você invista em imóveis sem precisar comprar um apartamento. Com R$ 10 você já pode ser 'dono' de uma fração de um shopping, escritório ou galpão logístico." },
      { title: "Explicação", content: "Os FIIs funcionam como um condomínio de investidores. O fundo compra imóveis e distribui os aluguéis entre os cotistas (investidores). A grande vantagem: os rendimentos mensais (dividendos) são ISENTOS de Imposto de Renda para pessoa física. É como receber aluguel todo mês sem ter imóvel." },
      { title: "Dicas Práticas", content: "1️⃣ Comece pesquisando FIIs de tijolo (imóveis físicos).\n2️⃣ Verifique a taxa de vacância (quanto menor, melhor).\n3️⃣ Diversifique entre diferentes tipos de FIIs.\n4️⃣ Reinvista os dividendos para crescer mais rápido.\n5️⃣ Não compre FII só pelo dividendo alto — analise o imóvel." },
    ],
  },
  {
    id: "inv_7", title: "Imposto de Renda sobre investimentos", emoji: "🧾", color: "bg-danger/5 border-danger/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "Entender a tributação dos investimentos é essencial para maximizar seus ganhos. Alguns investimentos são isentos de IR, outros seguem uma tabela regressiva. Saber disso pode fazer você escolher melhor onde investir." },
      { title: "Explicação", content: "A tabela regressiva de IR para renda fixa é:\n📌 Até 180 dias: 22,5%\n📌 181 a 360 dias: 20%\n📌 361 a 720 dias: 17,5%\n📌 Acima de 720 dias: 15%\n\nIsento de IR: LCI, LCA, poupança, dividendos de FIIs e ações (vendas até R$ 20mil/mês). Quanto mais tempo investido, menos imposto você paga." },
      { title: "Dicas Práticas", content: "1️⃣ Prefira investimentos de longo prazo para pagar menos IR.\n2️⃣ Considere LCI/LCA quando a isenção de IR compensar.\n3️⃣ Mantenha registros de todas as operações para a declaração.\n4️⃣ Use corretoras que fornecem informe de rendimentos.\n5️⃣ Planeje vendas de ações para ficar abaixo de R$ 20mil/mês." },
    ],
  },
  {
    id: "inv_8", title: "Perfil de investidor: qual é o seu?", emoji: "🎭", color: "bg-accent/5 border-accent/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "Conhecer seu perfil de investidor é fundamental para escolher os investimentos certos. Não existe investimento 'melhor' — existe o melhor para VOCÊ, baseado na sua tolerância ao risco e objetivos." },
      { title: "Explicação", content: "Existem três perfis principais:\n📌 Conservador: prioriza segurança. Prefere renda fixa e aceita rendimentos menores.\n📌 Moderado: equilibra segurança e rentabilidade. Mistura renda fixa com variável.\n📌 Arrojado/Agressivo: busca máxima rentabilidade. Aceita mais risco e volatilidade.\n\nSeu perfil pode mudar com o tempo conforme ganha experiência." },
      { title: "Dicas Práticas", content: "1️⃣ Faça o teste de perfil de investidor na sua corretora.\n2️⃣ Comece conservador mesmo que seu perfil seja arrojado.\n3️⃣ Nunca invista em algo que te faça perder o sono.\n4️⃣ Reavalie seu perfil a cada 2 anos.\n5️⃣ Idade não define perfil — sua situação financeira sim." },
    ],
  },
  {
    id: "inv_9", title: "ETFs: investindo em índices", emoji: "📈", color: "bg-brand-green/5 border-brand-green/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "ETFs (Exchange Traded Funds) são fundos que replicam índices da bolsa. Com uma única compra, você investe em dezenas ou centenas de empresas ao mesmo tempo. É a forma mais simples e barata de diversificar em ações." },
      { title: "Explicação", content: "O ETF mais famoso no Brasil é o BOVA11, que replica o Ibovespa (as maiores empresas da bolsa). Quando você compra uma cota de BOVA11, é como se comprasse um pedacinho de todas as empresas do índice. As taxas de administração são muito baixas (0,10% a 0,50% ao ano)." },
      { title: "Dicas Práticas", content: "1️⃣ Comece pelo BOVA11 ou IVVB11 (S&P 500 em reais).\n2️⃣ Invista regularmente, independente do preço (DCA).\n3️⃣ ETFs são ótimos para quem não quer escolher ações individualmente.\n4️⃣ Verifique a taxa de administração antes de comprar.\n5️⃣ Combine ETFs nacionais com internacionais para diversificação global." },
    ],
  },
  {
    id: "inv_10", title: "Juros compostos: a 8ª maravilha", emoji: "✨", color: "bg-brand-gold/5 border-brand-gold/20", level: "investidor",
    pages: [
      { title: "Introdução", content: "Albert Einstein teria dito que os juros compostos são a oitava maravilha do mundo. Quem entende, ganha; quem não entende, paga. Dominar esse conceito é o que separa quem constrói riqueza de quem fica preso em dívidas." },
      { title: "Explicação", content: "Juros compostos significam 'juros sobre juros'. Se você investe R$ 1.000 a 10% ao ano: no 1º ano ganha R$ 100 (total R$ 1.100). No 2º ano, ganha 10% sobre R$ 1.100 = R$ 110 (total R$ 1.210). Quanto mais tempo, maior o efeito. R$ 500/mês por 30 anos a 10% ao ano = R$ 1.130.243,96 — você investiu apenas R$ 180.000!" },
      { title: "Dicas Práticas", content: "1️⃣ Comece a investir o mais cedo possível — tempo é seu maior aliado.\n2️⃣ Reinvista TODOS os rendimentos.\n3️⃣ Nunca resgate investimentos antes do necessário.\n4️⃣ Use calculadoras de juros compostos para visualizar o futuro.\n5️⃣ A consistência mensal importa mais que o valor investido." },
    ],
  },
  // INDEPENDENTE (10 topics)
  {
    id: "ind_1", title: "LCI e LCA: renda fixa sem imposto", emoji: "🌾", color: "bg-warning/5 border-warning/20", level: "independente",
    pages: [
      { title: "Introdução", content: "LCI e LCA são investimentos de renda fixa com uma grande vantagem: são ISENTOS de Imposto de Renda para pessoa física. Todo o rendimento é líquido." },
      { title: "Explicação", content: "Quando você investe em LCI, o banco usa seu dinheiro para financiar o setor imobiliário. Na LCA, para o agronegócio. A isenção de IR faz com que um LCI/LCA que paga 90% do CDI renda mais que um CDB que paga 100% do CDI. São protegidos pelo FGC até R$ 250 mil." },
      { title: "Dicas Práticas", content: "1️⃣ Compare o rendimento líquido (LCI/LCA) com o bruto (CDB).\n2️⃣ Use LCI/LCA para dinheiro de médio prazo.\n3️⃣ Procure LCIs/LCAs que pagam pelo menos 90% do CDI.\n4️⃣ Verifique o prazo de carência antes de investir.\n5️⃣ Combine com CDB líquido para ter liquidez e rentabilidade." },
    ],
  },
  {
    id: "ind_2", title: "Poupança x CDB x Tesouro: comparativo", emoji: "📈", color: "bg-danger/5 border-danger/20", level: "independente",
    pages: [
      { title: "Introdução", content: "A poupança ainda é o investimento mais popular do Brasil, mas é o que MENOS rende. Entender as diferenças pode fazer você ganhar centenas de reais a mais por ano." },
      { title: "Explicação", content: "Comparando R$ 1.000 investidos por 1 ano:\n📌 Poupança: R$ 1.061 (~6,17% ao ano)\n📌 CDB 100% CDI: R$ 1.086 (~8,7% líquido)\n📌 Tesouro Selic: R$ 1.085 (~8,6% líquido)\n📌 LCI 90% CDI: R$ 1.090 (~9% isento de IR)\n\nCom R$ 10.000, a diferença passa de R$ 250 por ano." },
      { title: "Dicas Práticas", content: "1️⃣ Tire seu dinheiro da poupança HOJE.\n2️⃣ Use a planilha: multiplique seu saldo pela diferença de rendimento.\n3️⃣ Para emergências: CDB liquidez diária ou Tesouro Selic.\n4️⃣ Para médio prazo: LCI/LCA ou CDB de prazo maior.\n5️⃣ Diversifique entre pelo menos 2 tipos de investimento." },
    ],
  },
  {
    id: "ind_3", title: "Quanto investir por mês?", emoji: "💰", color: "bg-primary/5 border-primary/20", level: "independente",
    pages: [
      { title: "Introdução", content: "A pergunta mais comum de quem começa é: 'Quanto eu preciso investir por mês?'. A resposta: comece com o que puder. O mais importante é a CONSISTÊNCIA." },
      { title: "Explicação", content: "A regra 50-30-20 é um bom ponto de partida: 50% necessidades, 30% desejos, 20% investimentos. Se 20% parece muito, comece com 5%. O poder dos juros compostos: R$ 100/mês durante 20 anos a 10% ao ano = R$ 76.000 (você investiu R$ 24.000)." },
      { title: "Dicas Práticas", content: "1️⃣ Defina um percentual fixo da renda (comece com 5%).\n2️⃣ Invista ANTES de gastar — no dia do pagamento.\n3️⃣ Configure investimentos automáticos.\n4️⃣ Aumente o percentual a cada aumento de salário.\n5️⃣ Trate o investimento como uma 'conta obrigatória'." },
    ],
  },
  {
    id: "ind_4", title: "Erros comuns de quem começa", emoji: "🚫", color: "bg-danger/5 border-danger/20", level: "independente",
    pages: [
      { title: "Introdução", content: "Começar a investir é emocionante, mas existem armadilhas. Conhecer os erros mais comuns é a melhor forma de evitá-los." },
      { title: "Explicação", content: "Os erros mais comuns:\n❌ Investir sem ter reserva de emergência.\n❌ Colocar tudo em um único investimento.\n❌ Resgatar antes do prazo.\n❌ Não pesquisar taxas.\n❌ Acreditar em promessas de retorno alto — é golpe.\n❌ Investir em algo que não entende.\n❌ Comparar com os outros." },
      { title: "Dicas Práticas", content: "1️⃣ Monte sua reserva ANTES de investir.\n2️⃣ Diversifique sempre.\n3️⃣ Respeite prazos.\n4️⃣ Use corretoras com taxa zero.\n5️⃣ Desconfie de promessas acima de 2% ao mês.\n6️⃣ Estude antes de investir." },
    ],
  },
  {
    id: "ind_5", title: "Independência financeira: o que é?", emoji: "🏖️", color: "bg-safe/5 border-safe/20", level: "independente",
    pages: [
      { title: "Introdução", content: "Independência financeira é o ponto em que seus investimentos geram renda suficiente para cobrir todos os seus gastos. Você não precisa mais trabalhar por obrigação — trabalha por escolha." },
      { title: "Explicação", content: "A fórmula é simples: se seus gastos mensais são R$ 5.000, você precisa de investimentos que gerem pelo menos R$ 5.000/mês. Pela regra dos 4%, isso significa ter 300x seus gastos mensais investidos: R$ 5.000 × 300 = R$ 1.500.000. Parece muito, mas com disciplina e juros compostos, é atingível." },
      { title: "Dicas Práticas", content: "1️⃣ Calcule seu 'número mágico' (gastos mensais × 300).\n2️⃣ Reduza gastos para diminuir o número necessário.\n3️⃣ Aumente a renda para investir mais e chegar mais rápido.\n4️⃣ Foque em investimentos que geram renda passiva.\n5️⃣ Acompanhe sua evolução mês a mês no Futuro Real." },
    ],
  },
  {
    id: "ind_6", title: "Previdência privada: vale a pena?", emoji: "👴", color: "bg-brand-gold/5 border-brand-gold/20", level: "independente",
    pages: [
      { title: "Introdução", content: "A previdência privada é um dos investimentos mais controversos do Brasil. Para alguns, é uma ótima ferramenta de planejamento. Para outros, uma armadilha de taxas altas. A verdade depende do seu caso específico." },
      { title: "Explicação", content: "Existem dois tipos: PGBL (deduz até 12% da renda bruta no IR) e VGBL (não deduz, mas paga IR apenas sobre os rendimentos). O PGBL é vantajoso para quem faz declaração completa do IR. O VGBL para quem faz declaração simplificada. CUIDADO com taxas de administração e carregamento acima de 1% ao ano." },
      { title: "Dicas Práticas", content: "1️⃣ Só contrate PGBL se fizer declaração completa do IR.\n2️⃣ Busque taxas de administração abaixo de 1% ao ano.\n3️⃣ Evite taxas de carregamento (muitas corretoras não cobram).\n4️⃣ Compare com Tesouro IPCA+ antes de decidir.\n5️⃣ Use a tabela regressiva de IR para prazos longos (10+ anos)." },
    ],
  },
  {
    id: "ind_7", title: "Investimentos internacionais", emoji: "🌎", color: "bg-brand-blue/5 border-brand-blue/20", level: "independente",
    pages: [
      { title: "Introdução", content: "Investir fora do Brasil é mais fácil do que parece e cada vez mais acessível. Dolarizar parte do patrimônio protege contra crises locais e dá acesso às maiores empresas do mundo." },
      { title: "Explicação", content: "As formas mais simples de investir no exterior: ETFs internacionais na B3 (como IVVB11 que replica o S&P 500), BDRs (ações estrangeiras negociadas no Brasil) ou contas em corretoras internacionais (Avenue, Nomad, Inter Global). Recomenda-se ter 10% a 30% em investimentos internacionais." },
      { title: "Dicas Práticas", content: "1️⃣ Comece com ETFs internacionais na B3 (mais simples).\n2️⃣ IVVB11 (S&P 500) é a porta de entrada mais popular.\n3️⃣ Abra conta em corretora internacional para mais opções.\n4️⃣ Não tente prever o câmbio — invista regularmente.\n5️⃣ Mantenha 10-30% do patrimônio dolarizado." },
    ],
  },
  {
    id: "ind_8", title: "Criando múltiplas fontes de renda", emoji: "🔄", color: "bg-accent/5 border-accent/20", level: "independente",
    pages: [
      { title: "Introdução", content: "Depender de uma única fonte de renda é arriscado. Os mais ricos do mundo têm em média 7 fontes de renda diferentes. Criar múltiplas fontes não precisa ser complicado — é sobre diversificar como você ganha dinheiro." },
      { title: "Explicação", content: "As principais fontes de renda são: 1) Salário (renda ativa), 2) Freelancer/serviços, 3) Dividendos de ações e FIIs, 4) Juros de renda fixa, 5) Aluguel de imóveis, 6) Negócio próprio, 7) Produtos digitais. Comece adicionando uma fonte por vez à sua renda principal." },
      { title: "Dicas Práticas", content: "1️⃣ Identifique habilidades que podem gerar renda extra.\n2️⃣ Invista para gerar renda passiva (dividendos, juros).\n3️⃣ Considere criar um produto digital (curso, ebook).\n4️⃣ Diversifique gradualmente — não tente tudo de uma vez.\n5️⃣ Reinvista a renda extra para acelerar o crescimento." },
    ],
  },
  {
    id: "ind_9", title: "Planejamento sucessório e proteção", emoji: "📋", color: "bg-warning/5 border-warning/20", level: "independente",
    pages: [
      { title: "Introdução", content: "Planejamento sucessório é pensar em como seu patrimônio será distribuído quando você não estiver mais aqui. Pode parecer um tema difícil, mas ignorá-lo pode causar grandes prejuízos financeiros e familiares." },
      { title: "Explicação", content: "Sem planejamento, o inventário pode custar de 10% a 20% do patrimônio em impostos e honorários. Ferramentas como seguro de vida, previdência privada (VGBL) e doações em vida podem reduzir drasticamente esses custos. A VGBL, por exemplo, não entra no inventário e vai direto para o beneficiário." },
      { title: "Dicas Práticas", content: "1️⃣ Faça um inventário completo dos seus bens e investimentos.\n2️⃣ Considere um seguro de vida para proteger dependentes.\n3️⃣ VGBL pode ser usada como ferramenta de transmissão de patrimônio.\n4️⃣ Consulte um advogado para planejamento mais complexo.\n5️⃣ Mantenha documentação organizada e acessível para familiares." },
    ],
  },
  {
    id: "ind_10", title: "Mindset de abundância financeira", emoji: "🧘", color: "bg-brand-green/5 border-brand-green/20", level: "independente",
    pages: [
      { title: "Introdução", content: "Sua mentalidade sobre dinheiro determina seus resultados financeiros. Crenças limitantes como 'dinheiro é sujo' ou 'rico é desonesto' sabotam silenciosamente suas finanças. Desenvolver um mindset de abundância é tão importante quanto saber investir." },
      { title: "Explicação", content: "O mindset de escassez faz você tomar decisões por medo: não investir por medo de perder, não empreender por medo de fracassar, gastar tudo por medo de 'não aproveitar'. O mindset de abundância entende que dinheiro é uma ferramenta, que existem oportunidades para todos e que riqueza se constrói com conhecimento, disciplina e tempo." },
      { title: "Dicas Práticas", content: "1️⃣ Identifique suas crenças limitantes sobre dinheiro.\n2️⃣ Leia livros como 'Pai Rico, Pai Pobre' e 'Os Segredos da Mente Milionária'.\n3️⃣ Cerque-se de pessoas que têm boa relação com dinheiro.\n4️⃣ Celebre suas conquistas financeiras, por menores que sejam.\n5️⃣ Ensine o que aprende — ensinar solidifica o conhecimento." },
    ],
  },
];

const levels = ["iniciante", "organizado", "investidor", "independente"] as const;

// All mission IDs from Missoes page
const allMissionIds = [
  "anotar-gastos", "guardar-valor", "listar-dividas", "cortar-gasto", "meta-semana",
  "comparar-precos", "cozinhar-casa", "reserva-50", "renegociar-divida", "planejar-compras", "sem-delivery",
  "abrir-corretora", "primeiro-investimento", "tesouro-direto", "reserva-3meses", "diversificar",
  "reserva-6meses", "renda-extra", "planejamento-anual", "ensinar-alguem", "zero-dividas",
];

const allMissionLabels: Record<string, string> = {
  "anotar-gastos": "Anote todos os gastos de hoje",
  "guardar-valor": "Guarde qualquer valor",
  "listar-dividas": "Liste todas as suas dívidas",
  "cortar-gasto": "Corte um gasto desnecessário",
  "meta-semana": "Defina uma meta para a semana",
  "comparar-precos": "Compare preços antes de comprar",
  "cozinhar-casa": "Cozinhe todas as refeições hoje",
  "reserva-50": "Guarde R$ 50 este mês",
  "renegociar-divida": "Renegocie uma dívida",
  "planejar-compras": "Planeje suas compras da semana",
  "sem-delivery": "Fique 7 dias sem pedir delivery",
  "abrir-corretora": "Abra conta em uma corretora",
  "primeiro-investimento": "Faça seu primeiro investimento",
  "tesouro-direto": "Pesquise sobre Tesouro Direto",
  "reserva-3meses": "Monte reserva de 3 meses",
  "diversificar": "Diversifique seus investimentos",
  "reserva-6meses": "Monte reserva de 6 meses",
  "renda-extra": "Crie uma fonte de renda extra",
  "planejamento-anual": "Faça um planejamento anual",
  "ensinar-alguem": "Ensine alguém sobre finanças",
  "zero-dividas": "Quite todas as dívidas",
};

const Educacao = () => {
  const { isPremium, user } = useAuth();
  const { data: financialData, saveData } = useFinancialData();
  const navigate = useNavigate();
  const [openArticle, setOpenArticle] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studyStartTime, setStudyStartTime] = useState<number | null>(null);
  const [showModuleComplete, setShowModuleComplete] = useState<string | null>(null);
  const [studyDuration, setStudyDuration] = useState<number | null>(null);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [certName, setCertName] = useState("");
  const [certCpf, setCertCpf] = useState("");
  const [certLoading, setCertLoading] = useState(false);
  const [existingCert, setExistingCert] = useState<string | null>(null);

  const completedTopics = financialData.completedMissions.filter(m => m.startsWith("edu_"));

  function isTopicCompleted(id: string) {
    return completedTopics.includes("edu_" + id);
  }

  function getModuleTopics(level: string) {
    return articles.filter(a => a.level === level);
  }

  function isModuleCompleted(level: string) {
    const moduleTopics = getModuleTopics(level);
    return moduleTopics.length > 0 && moduleTopics.every(a => isTopicCompleted(a.id));
  }

  // Progress calculations
  const totalTopics = articles.length;
  const completedCount = completedTopics.length;
  const overallProgress = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

  // Per-level progress for the progress bar
  function getLevelProgress(level: string) {
    const moduleTopics = getModuleTopics(level);
    const completed = moduleTopics.filter(a => isTopicCompleted(a.id)).length;
    return moduleTopics.length > 0 ? (completed / moduleTopics.length) * 100 : 0;
  }

  // Current active level index (first non-completed level)
  const currentLevelIndex = levels.findIndex(l => !isModuleCompleted(l));
  const allModulesCompleted = levels.every(l => isModuleCompleted(l));
  const allMissionsCompleted = allMissionIds.every(id => financialData.completedMissions.includes(id));
  const canGetCertificate = allModulesCompleted && allMissionsCompleted;

  // Check for existing certificate
  useEffect(() => {
    if (user && canGetCertificate) {
      supabase.from("certificates").select("verification_code").eq("user_id", user.id).limit(1).then(({ data }) => {
        if (data && data.length > 0) setExistingCert(data[0].verification_code);
      });
    }
  }, [user, canGetCertificate]);

  // Calculate total study time (rough estimate: count completed edu topics * average read time or use stored data)
  function getTotalStudySeconds(): number {
    // Estimate ~3 minutes per topic completed (3 pages each)
    const eduCompleted = financialData.completedMissions.filter(m => m.startsWith("edu_")).length;
    return eduCompleted * 180; // 3 min per topic as base estimate
  }

  async function handleGenerateCertificate() {
    if (!user || !certCpf.trim() || !certName.trim()) return;
    setCertLoading(true);

    const verificationCode = `FRB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const completionDate = new Date();
    const studySeconds = getTotalStudySeconds();

    // Use the name provided by the user in the dialog
    const userName = certName.trim() || user.email || "Aluno";

    // Save name to profile
    await supabase.from("profiles").update({ display_name: userName }).eq("user_id", user.id);

    // Save CPF to profile
    await supabase.from("profiles").update({ cpf: certCpf.trim() }).eq("user_id", user.id);

    // Get completed missions names
    const completedMissionNames = allMissionIds
      .filter(id => financialData.completedMissions.includes(id))
      .map(id => allMissionLabels[id] || id);

    // Save certificate to DB
    await supabase.from("certificates").insert({
      user_id: user.id,
      user_name: userName,
      user_cpf: certCpf.trim(),
      verification_code: verificationCode,
      completion_date: completionDate.toISOString(),
      study_hours_total: studySeconds,
      modules_completed: [...levels],
      missions_completed: completedMissionNames,
    });

    // Generate PDF
    await generateCertificatePDF({
      userName,
      userCpf: certCpf.trim(),
      completionDate: completionDate.toLocaleDateString("pt-BR"),
      verificationCode,
      studyHoursTotal: studySeconds,
      modulesCompleted: [...levels],
      missionsCompleted: completedMissionNames,
    }, window.location.origin);

    setExistingCert(verificationCode);
    setCertLoading(false);
    setShowCertDialog(false);
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
  }

  async function handleRedownloadCertificate() {
    if (!existingCert || !user) return;
    setCertLoading(true);

    const { data: cert } = await supabase.from("certificates").select("*").eq("verification_code", existingCert).single();
    if (cert) {
      await generateCertificatePDF({
        userName: cert.user_name,
        userCpf: cert.user_cpf,
        completionDate: new Date(cert.completion_date).toLocaleDateString("pt-BR"),
        verificationCode: cert.verification_code,
        studyHoursTotal: Number(cert.study_hours_total),
        modulesCompleted: cert.modules_completed as string[],
        missionsCompleted: cert.missions_completed as string[],
      }, window.location.origin);
    }
    setCertLoading(false);
  }

  async function markTopicComplete(articleId: string) {
    const key = "edu_" + articleId;
    if (financialData.completedMissions.includes(key)) return;

    const updated = [...financialData.completedMissions, key];
    await saveData({ completedMissions: updated });

    // Check if this completes a module
    const article = articles.find(a => a.id === articleId);
    if (article) {
      const moduleTopics = getModuleTopics(article.level);
      const willBeComplete = moduleTopics.every(a =>
        a.id === articleId || financialData.completedMissions.includes("edu_" + a.id)
      );
      if (willBeComplete) {
        // Show confetti and module complete message
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setShowModuleComplete(article.level);
        setTimeout(() => setShowModuleComplete(null), 4000);
      }
    }
  }

  function handleOpenArticle(index: number) {
    setOpenArticle(index);
    setCurrentPage(0);
    setStudyStartTime(Date.now());
    setStudyDuration(null);
  }

  function handleCloseArticle() {
    if (studyStartTime) {
      const elapsed = Math.round((Date.now() - studyStartTime) / 1000);
      setStudyDuration(elapsed);
    }
    setOpenArticle(null);
    setCurrentPage(0);
    setStudyStartTime(null);
  }

  async function handleFinishArticle() {
    if (openArticle === null) return;
    const article = articles[openArticle];
    const elapsed = studyStartTime ? Math.round((Date.now() - studyStartTime) / 1000) : 0;
    setStudyDuration(elapsed);
    await markTopicComplete(article.id);
    setOpenArticle(null);
    setCurrentPage(0);
    setStudyStartTime(null);
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}min ${secs}s`;
  }

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
    const alreadyCompleted = isTopicCompleted(article.id);

    return (
      <AppLayout>
        <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
          <button onClick={handleCloseArticle} className="text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{article.emoji}</span>
            <h1 className="text-xl font-extrabold text-foreground">{article.title}</h1>
          </div>

          {/* Study timer */}
          {studyStartTime && (
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <StudyTimer startTime={studyStartTime} />
            </div>
          )}

          {/* Page indicators */}
          <div className="flex gap-2 mb-4">
            {article.pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`flex-1 h-1.5 rounded-full transition-colors ${i === currentPage ? "bg-primary" : i < currentPage ? "bg-safe" : "bg-muted"}`}
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
                onClick={handleFinishArticle}
                className={alreadyCompleted ? "text-safe border-safe" : "bg-safe text-white hover:bg-safe/90"}
                variant={alreadyCompleted ? "outline" : "default"}
              >
                {alreadyCompleted ? "✓ Já Estudado" : "✓ Concluir"}
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

        {/* Study duration feedback */}
        {studyDuration !== null && (
          <div className="bg-safe/10 border border-safe/20 rounded-xl p-3 mb-4 flex items-center gap-2 animate-fade-up">
            <Clock className="w-4 h-4 text-safe" />
            <span className="text-sm text-safe font-medium">Você estudou por {formatDuration(studyDuration)}</span>
            <button onClick={() => setStudyDuration(null)} className="ml-auto text-muted-foreground text-xs hover:text-foreground">✕</button>
          </div>
        )}

        {/* Module complete celebration */}
        {showModuleComplete && (
          <div className="bg-safe/10 border border-safe/20 rounded-xl p-4 mb-4 text-center animate-fade-up">
            <p className="text-lg font-extrabold text-safe">🎉 Parabéns!</p>
            <p className="text-sm text-safe">Você concluiu o módulo {levelInfo[showModuleComplete as keyof typeof levelInfo]?.label}!</p>
          </div>
        )}

        {/* Overall Progress Bar */}
        <div className="bg-card rounded-2xl p-4 border shadow-sm mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">Progresso Geral</span>
            <span className="text-xs text-muted-foreground">
              {canGetCertificate ? `${totalTopics}/${totalTopics} tópicos` : `${completedCount}/${totalTopics} tópicos`}
            </span>
          </div>
          <Progress value={canGetCertificate ? 0 : overallProgress} className="h-3 mb-3" />

          {/* Level progress steps */}
          <div className="flex items-center gap-1 mt-3">
            {levels.map((level, i) => {
              const completed = isModuleCompleted(level);
              const progress = getLevelProgress(level);
              const labels = ["🌱", "📋", "📈", "🏆"];
              const resetStyle = canGetCertificate;
              return (
                <div key={level} className="flex-1 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 border-2 transition-all ${
                    resetStyle ? "bg-muted border-muted-foreground/20 text-muted-foreground" :
                    completed ? "bg-safe border-safe text-white" : progress > 0 ? "bg-primary/10 border-primary text-primary" : "bg-muted border-muted-foreground/20 text-muted-foreground"
                  }`}>
                    {!resetStyle && completed ? "✓" : labels[i]}
                  </div>
                  <span className={`text-[10px] font-medium text-center leading-tight ${!resetStyle && completed ? "text-safe" : "text-muted-foreground"}`}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </span>
                  {!resetStyle && progress > 0 && !completed && (
                    <span className="text-[9px] text-primary font-bold">{Math.round(progress)}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* All modules completed message */}
        {allModulesCompleted && (
          <div className="bg-safe/10 border border-safe/20 rounded-xl p-4 mb-6 text-center animate-fade-up">
            <p className="text-lg font-extrabold text-safe">🏆 Todos os módulos concluídos!</p>
            <p className="text-sm text-safe/80">Você pode revisar qualquer módulo quando quiser.</p>
          </div>
        )}

        {/* Certificate Section */}
        {canGetCertificate && (
          <div className="bg-gradient-to-br from-brand-gold/10 to-brand-green/10 border border-brand-gold/30 rounded-2xl p-5 mb-6 text-center animate-fade-up">
            <Award className="w-10 h-10 text-brand-gold mx-auto mb-2" />
            <p className="text-lg font-extrabold text-foreground mb-1">🎓 Certificado Disponível!</p>
            <p className="text-sm text-muted-foreground mb-4">Você concluiu todos os módulos de Educação Financeira e todas as Missões. Parabéns!</p>
            {existingCert ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Código: <span className="font-mono font-bold text-foreground">{existingCert}</span></p>
                <Button onClick={handleRedownloadCertificate} disabled={certLoading} className="w-full">
                  {certLoading ? "Gerando..." : "📄 Baixar Certificado Novamente"}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowCertDialog(true)} className="w-full bg-brand-gold text-white hover:bg-brand-gold/90">
                📄 Gerar Meu Certificado
              </Button>
            )}
          </div>
        )}

        {!canGetCertificate && allModulesCompleted && !allMissionsCompleted && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 text-center animate-fade-up">
            <p className="text-sm font-bold text-warning">📋 Complete todas as Missões para liberar seu certificado</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/missoes")}>Ir para Missões</Button>
          </div>
        )}

        {levels.map((level) => {
          const lvl = levelInfo[level];
          const levelArticles = articles.map((a, i) => ({ ...a, index: i })).filter(a => a.level === level);
          if (levelArticles.length === 0) return null;
          const moduleCompleted = isModuleCompleted(level);
          const completedInModule = levelArticles.filter(a => isTopicCompleted(a.id)).length;

          return (
            <div key={level} className="mb-6">
              <div className={`rounded-xl p-3 mb-3 border ${moduleCompleted && !canGetCertificate ? lvl.completedColor : lvl.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{moduleCompleted && !canGetCertificate ? "✅ " : ""}{lvl.label}</span>
                  <span className="text-xs font-medium">{completedInModule}/{levelArticles.length}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">{lvl.desc}</p>
                {!moduleCompleted && completedInModule > 0 && (
                  <Progress value={(completedInModule / levelArticles.length) * 100} className="h-1.5 mt-2" />
                )}
              </div>

              <div className="space-y-3">
                {levelArticles.map((article) => {
                  const completed = isTopicCompleted(article.id);
                  return (
                    <button
                      key={article.index}
                      onClick={() => handleOpenArticle(article.index)}
                      className={`w-full text-left rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${completed && !canGetCertificate ? "bg-safe/5 border-safe/20" : "bg-card"}`}
                    >
                      <div className="flex items-center gap-3 p-4">
                        <span className="text-2xl">{completed && !canGetCertificate ? "✅" : article.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-bold block ${completed && !canGetCertificate ? "text-safe" : "text-foreground"}`}>{article.title}</span>
                          <span className="text-xs text-muted-foreground">{article.pages.length} telas • {completed && !canGetCertificate ? "Concluído" : "Toque para ler"}</span>
                        </div>
                        {completed && !canGetCertificate ? (
                          <CheckCircle2 className="w-5 h-5 text-safe shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CPF Dialog for Certificate */}
      <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">Gerar Certificado</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Informe seus dados para constar no certificado:</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Nome Completo</label>
              <Input
                placeholder="Seu nome completo"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">CPF</label>
              <Input
                placeholder="000.000.000-00"
                value={certCpf}
                onChange={(e) => setCertCpf(e.target.value)}
                maxLength={14}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCertDialog(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleGenerateCertificate} disabled={certLoading || !certCpf.trim() || !certName.trim()} className="flex-1">
              {certLoading ? "Gerando..." : "Gerar Certificado"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

// Real-time study timer component
function StudyTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return <span>Estudando há {mins > 0 ? `${mins}min ` : ""}{secs}s</span>;
}

export default Educacao;
