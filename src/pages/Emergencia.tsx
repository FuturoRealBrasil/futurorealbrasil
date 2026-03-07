import { useState } from "react";
import { AlertTriangle, Zap, ChevronRight, Lock, ArrowLeft, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";

interface ScenarioPage {
  title: string;
  content: string;
}

interface Scenario {
  id: string;
  icon: string;
  title: string;
  pages: ScenarioPage[];
  checklist: string[];
  cortes: string[];
  prioridades: string[];
}

const scenarios: Scenario[] = [
  {
    id: "desemprego",
    icon: "💼",
    title: "Desemprego",
    pages: [
      { title: "📖 Introdução", content: "Perder o emprego é uma das situações mais estressantes que uma pessoa pode enfrentar. Além da pressão financeira, há o impacto emocional e psicológico. Mas é fundamental manter a calma e agir de forma estratégica. Milhões de brasileiros já passaram por isso e se recuperaram. Você também pode." },
      { title: "📚 O que fazer", content: "Ações imediatas:\n\n1️⃣ Solicite seguro-desemprego o mais rápido possível (prazo de 7 a 120 dias após demissão).\n2️⃣ Verifique se tem direito ao saque do FGTS.\n3️⃣ Corte TODOS os gastos não essenciais imediatamente.\n4️⃣ Renegocie aluguel, dívidas e contas — explique a situação.\n5️⃣ Cadastre-se no SINE, Indeed, LinkedIn, Catho e InfoJobs.\n6️⃣ Atualize seu CadÚnico para acessar benefícios do governo.\n7️⃣ Considere trabalhos temporários, freelance ou bicos." },
      { title: "💡 Estratégias", content: "Estratégias de sobrevivência financeira:\n\n• Faça um orçamento de emergência: só o essencial.\n• Priorize: alimentação > moradia > saúde > transporte.\n• Cancele assinaturas, streaming e serviços não essenciais.\n• Venda itens que não usa mais (roupas, eletrônicos, móveis).\n• Busque doações em ONGs e igrejas se necessário.\n• Use programas do governo: Bolsa Família, Tarifa Social.\n• Mantenha uma rotina: acordar cedo, procurar emprego diariamente.\n• Cuide da saúde mental — peça ajuda se precisar (CVV: 188)." },
    ],
    checklist: ["Solicite seguro-desemprego imediatamente", "Corte todos os gastos não essenciais", "Renegocie aluguel e dívidas", "Cadastre-se no SINE e sites de emprego", "Considere trabalhos temporários ou freelance", "Atualize seu CadÚnico para benefícios"],
    cortes: ["Streaming e assinaturas", "Delivery e alimentação fora", "Compras parceladas não essenciais"],
    prioridades: ["1. Alimentação", "2. Moradia", "3. Saúde", "4. Transporte para buscar emprego"],
  },
  {
    id: "doenca",
    icon: "🏥",
    title: "Doença na família",
    pages: [
      { title: "📖 Introdução", content: "Uma doença inesperada na família pode abalar completamente as finanças de um lar. Além da preocupação com a saúde do ente querido, surgem gastos com medicamentos, exames e até perda de renda. É uma situação que exige calma, planejamento e conhecimento dos direitos disponíveis." },
      { title: "📚 Direitos e Recursos", content: "O SUS cobre a maioria dos tratamentos:\n\n1️⃣ Consultas, exames, cirurgias e internações são gratuitos.\n2️⃣ Medicamentos pelo programa Farmácia Popular (até 90% de desconto).\n3️⃣ Se você é CLT: tem direito ao auxílio-doença (15 dias pago pela empresa + INSS).\n4️⃣ Saque do FGTS por doença grave (câncer, HIV, etc.).\n5️⃣ Isenção de IR para portadores de doenças graves.\n6️⃣ Assistente social do hospital pode orientar sobre benefícios." },
      { title: "💡 Plano de Ação", content: "Como se organizar financeiramente:\n\n• Priorize o tratamento — saúde primeiro, sempre.\n• Busque tratamento no SUS antes de considerar particular.\n• Peça segunda opinião médica se necessário.\n• Solicite relatório médico detalhado para pleitear benefícios.\n• Organize documentos: laudo, receitas, comprovantes.\n• Renegocie dívidas alegando problema de saúde.\n• Peça ajuda a familiares e amigos — não tenha vergonha.\n• Pesquise ONGs que ajudam pacientes na sua condição." },
    ],
    checklist: ["Verifique cobertura do SUS para seu caso", "Solicite auxílio-doença se for CLT", "Peça ajuda na UBS mais próxima", "Busque medicamentos genéricos ou pelo Farmácia Popular", "Fale com assistente social do hospital"],
    cortes: ["Gastos variáveis não urgentes", "Lazer temporariamente"],
    prioridades: ["1. Tratamento médico", "2. Alimentação adequada", "3. Moradia", "4. Medicamentos"],
  },
  {
    id: "enchente",
    icon: "🌊",
    title: "Enchente / Desastre",
    pages: [
      { title: "📖 Introdução", content: "Desastres naturais como enchentes, deslizamentos e tempestades podem destruir em horas o que levou anos para construir. O Brasil enfrenta esses eventos com frequência crescente. Saber o que fazer antes, durante e depois pode salvar vidas e minimizar prejuízos financeiros." },
      { title: "📚 Durante a Emergência", content: "Ações imediatas:\n\n1️⃣ Segurança primeiro: vá para um local seguro e elevado.\n2️⃣ Ligue para a Defesa Civil: 199.\n3️⃣ Não tente atravessar áreas alagadas.\n4️⃣ Se possível, salve documentos e dinheiro.\n5️⃣ Registre danos com fotos e vídeos (importante para seguro e FGTS).\n6️⃣ Procure abrigos oficiais da Defesa Civil.\n7️⃣ Não beba água de enchente — risco de leptospirose." },
      { title: "💡 Reconstrução", content: "Após o desastre:\n\n• Solicite saque do FGTS por calamidade pública.\n• Registre ocorrência na Defesa Civil para comprovar danos.\n• Busque doações em pontos de coleta oficiais.\n• Solicite isenção de contas (luz, água, gás) no período.\n• Procure a prefeitura para programa de reconstrução.\n• Se tem seguro, comunique imediatamente a seguradora.\n• Guarde TODOS os comprovantes de gastos com reparo.\n• Cadastre-se em programas de auxílio emergencial." },
    ],
    checklist: ["Procure abrigo seguro (Defesa Civil: 199)", "Documente danos com fotos e vídeos", "Solicite saque do FGTS por calamidade", "Cadastre-se na Defesa Civil para auxílio", "Busque doações em pontos de coleta oficiais"],
    cortes: ["Foque apenas no essencial até estabilizar"],
    prioridades: ["1. Segurança física", "2. Documentos", "3. Alimentação e água", "4. Moradia temporária"],
  },
  {
    id: "crise-precos",
    icon: "📈",
    title: "Crise de preços / Inflação",
    pages: [
      { title: "📖 Introdução", content: "Quando os preços sobem mais rápido que os salários, o poder de compra das famílias diminui. A inflação corrói silenciosamente o dinheiro que você ganha. Alimentos, combustível, aluguel — tudo fica mais caro. Mas existem estratégias para proteger suas finanças durante crises de preços." },
      { title: "📚 Entendendo a Inflação", content: "A inflação é medida pelo IPCA (Índice de Preços ao Consumidor Amplo). Quando ela está alta, seu dinheiro vale menos a cada mês. Por exemplo, com inflação de 10% ao ano, R$ 1.000 hoje valem apenas R$ 900 daqui a um ano em poder de compra.\n\nProdutos mais afetados pela inflação:\n• Alimentos (especialmente proteínas)\n• Combustível e transporte\n• Aluguel e moradia\n• Energia elétrica\n\nA melhor proteção: investir em títulos que acompanham a inflação (Tesouro IPCA+)." },
      { title: "💡 Como se Proteger", content: "Estratégias práticas contra a inflação:\n\n1️⃣ Substitua marcas caras por genéricas — qualidade similar, preço menor.\n2️⃣ Compre no atacado o que puder armazenar.\n3️⃣ Planeje refeições da semana ANTES de ir ao mercado.\n4️⃣ Reduza uso do carro — priorize transporte público ou carona.\n5️⃣ Compare preços online antes de comprar.\n6️⃣ Cozinhe em casa — economize até 70% vs. delivery.\n7️⃣ Invista em Tesouro IPCA+ para proteger seu dinheiro.\n8️⃣ Renegocie contratos com reajuste por inflação." },
    ],
    checklist: ["Substitua marcas caras por genéricas", "Compre no atacado o que puder", "Planeje refeições da semana antes de comprar", "Reduza uso de carro — priorize transporte público", "Busque promoções e compare preços online"],
    cortes: ["Marcas premium", "Refeições fora de casa", "Compras por impulso"],
    prioridades: ["1. Alimentação básica", "2. Contas fixas", "3. Transporte", "4. Saúde"],
  },
];

const Emergencia = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"pages" | "checklist">("pages");
  const { isPremium } = useAuth();
  const navigate = useNavigate();

  const toggleCheck = (scenarioId: string, index: number) => {
    const key = `${scenarioId}-${index}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (id: string) => {
    if (!isPremium) { navigate("/planos"); return; }
    setSelected(id);
    setCurrentPage(0);
    setViewMode("pages");
  };

  const scenario = scenarios.find((s) => s.id === selected);

  return (
    <AppLayout>
      <div className="px-5 py-6 pb-24 max-w-lg mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-danger" /> Modo Emergência
          </h1>
          <p className="text-sm text-muted-foreground mt-1">O que fazer quando a crise chegar</p>
        </div>

        {!isPremium && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-up">
            <Lock className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Recurso Premium</p>
              <p className="text-xs text-muted-foreground">Clique em qualquer tópico para ver os planos</p>
            </div>
          </div>
        )}

        {!selected ? (
          <div className="space-y-3">
            {scenarios.map((s, i) => (
              <button key={s.id} onClick={() => handleSelect(s.id)} className="w-full text-left bg-card rounded-xl p-4 border shadow-sm hover:shadow-md transition-all flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="text-3xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="text-base font-bold text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.pages.length} telas • {s.checklist.length} ações</p>
                </div>
                {!isPremium ? <Lock className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </button>
            ))}
          </div>
        ) : scenario ? (
          <div className="animate-fade-up">
            <button onClick={() => { setSelected(null); setCurrentPage(0); }} className="text-sm text-primary font-semibold mb-4 flex items-center gap-1">← Voltar</button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{scenario.icon}</span>
              <h2 className="text-xl font-extrabold text-foreground">{scenario.title}</h2>
            </div>

            {/* View toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setViewMode("pages")}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${viewMode === "pages" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                📚 Conteúdo
              </button>
              <button
                onClick={() => setViewMode("checklist")}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${viewMode === "checklist" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                ✅ Checklist
              </button>
            </div>

            {viewMode === "pages" ? (
              <>
                {/* Page indicators */}
                <div className="flex gap-2 mb-4">
                  {scenario.pages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`flex-1 h-1.5 rounded-full transition-colors ${i === currentPage ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>

                <div className="bg-card rounded-2xl border shadow-sm p-5">
                  <span className="text-xs font-bold text-primary mb-2 block">{scenario.pages[currentPage].title}</span>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{scenario.pages[currentPage].content}</p>
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} className="flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </Button>
                  {currentPage < scenario.pages.length - 1 ? (
                    <Button size="sm" onClick={() => setCurrentPage(currentPage + 1)} className="flex items-center gap-1">
                      Próximo <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setViewMode("checklist")} className="text-brand-green border-brand-green">
                      Ver Checklist →
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-danger" /> Checklist Imediato</h3>
                  <div className="space-y-2">
                    {scenario.checklist.map((item, i) => {
                      const isChecked = checked[`${scenario.id}-${i}`];
                      return (
                        <button key={i} onClick={() => toggleCheck(scenario.id, i)} className="w-full flex items-start gap-3 bg-card rounded-lg p-3 border text-left transition-all">
                          <span className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isChecked ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                            {isChecked && <span className="text-primary-foreground text-xs font-bold">✓</span>}
                          </span>
                          <span className={`text-sm transition-colors ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-foreground mb-3">✂️ Cortes Urgentes</h3>
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 space-y-2">
                    {scenario.cortes.map((c, i) => (<p key={i} className="text-sm text-foreground flex items-center gap-2"><span className="text-danger">✕</span> {c}</p>))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">🎯 Prioridades Financeiras</h3>
                  <div className="bg-safe/5 border border-safe/20 rounded-xl p-4 space-y-2">
                    {scenario.prioridades.map((p, i) => (<p key={i} className="text-sm font-medium text-foreground">{p}</p>))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default Emergencia;
