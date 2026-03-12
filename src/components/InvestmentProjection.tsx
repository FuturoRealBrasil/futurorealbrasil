import { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Calculator, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface LiveRates {
  selic: number;
  cdi: number;
  cdb_100: number;
  cdb_120: number;
  tesouro_selic: number;
  lci_90: number;
  lca_90: number;
  tesouro_ipca: number;
  updated_at: string;
  fallback?: boolean;
}

const defaultRates: LiveRates = {
  selic: 0.1075,
  cdi: 0.1065,
  cdb_100: 0.1065,
  cdb_120: 0.1278,
  tesouro_selic: 0.1075,
  lci_90: 0.09585,
  lca_90: 0.09585,
  tesouro_ipca: 0.105,
  updated_at: new Date().toISOString(),
};

function getInvestmentTypes(rates: LiveRates) {
  return [
    { id: "cdb", label: "CDB (100% CDI)", annualRate: rates.cdb_100 },
    { id: "cdb_120", label: "CDB (120% CDI)", annualRate: rates.cdb_120 },
    { id: "tesouro_selic", label: "Tesouro Selic", annualRate: rates.tesouro_selic },
    { id: "lci", label: "LCI (90% CDI)", annualRate: rates.lci_90 },
    { id: "lca", label: "LCA (90% CDI)", annualRate: rates.lca_90 },
    { id: "tesouro_ipca", label: "Tesouro IPCA+ (6%+IPCA)", annualRate: rates.tesouro_ipca },
  ];
}

const periods = [
  { label: "1 mês", months: 1 },
  { label: "2 meses", months: 2 },
  { label: "3 meses", months: 3 },
  { label: "4 meses", months: 4 },
  { label: "5 meses", months: 5 },
  { label: "6 meses", months: 6 },
  { label: "7 meses", months: 7 },
  { label: "8 meses", months: 8 },
  { label: "9 meses", months: 9 },
  { label: "10 meses", months: 10 },
  { label: "11 meses", months: 11 },
  { label: "1 ano", months: 12 },
  { label: "2 anos", months: 24 },
  { label: "3 anos", months: 36 },
  { label: "4 anos", months: 48 },
  { label: "5 anos", months: 60 },
  { label: "6 anos", months: 72 },
  { label: "7 anos", months: 84 },
  { label: "8 anos", months: 96 },
  { label: "9 anos", months: 108 },
  { label: "10 anos", months: 120 },
];

function compoundInterest(principal: number, annualRate: number, months: number): number {
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  return principal * (Math.pow(1 + monthlyRate, months) - 1);
}

interface Props {
  investmentMonthly: number;
  selectedInvestment: string;
  setSelectedInvestment: (v: string) => void;
  isPremium: boolean;
  navigate: (path: string) => void;
}

export default function InvestmentProjection({ investmentMonthly, selectedInvestment, setSelectedInvestment, isPremium, navigate }: Props) {
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(5);
  const [rates, setRates] = useState<LiveRates>(defaultRates);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [showCalc, setShowCalc] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcReset, setCalcReset] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  async function fetchRates() {
    setRatesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-investment-rates");
      if (data && !error) {
        setRates(data as LiveRates);
        setLastUpdate(data.updated_at);
      }
    } catch {
      // Keep default rates
    }
    setRatesLoading(false);
  }

  const investmentTypes = getInvestmentTypes(rates);
  const selectedRate = investmentTypes.find(t => t.id === selectedInvestment)?.annualRate || rates.cdb_100;
  const period = periods[selectedPeriodIdx];

  const availablePeriods = isPremium ? periods : periods.slice(0, 6);

  const totalInvested = investmentMonthly * period.months;
  const interest = compoundInterest(investmentMonthly, selectedRate, period.months);
  const totalWithInterest = totalInvested + interest;

  return (
    <div className="bg-card rounded-2xl p-5 border shadow-sm mb-6 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-green" /> Projeção de Investimento
        </h2>
        <button
          onClick={fetchRates}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          disabled={ratesLoading}
        >
          <RefreshCw className={`w-3 h-3 ${ratesLoading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Live rate indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${ratesLoading ? "bg-warning animate-pulse" : "bg-safe"}`} />
        <span className="text-[10px] text-muted-foreground">
          {ratesLoading ? "Atualizando taxas..." : `Selic: ${(rates.selic * 100).toFixed(2)}% a.a. · CDI: ${(rates.cdi * 100).toFixed(2)}% a.a.`}
          {lastUpdate && !ratesLoading && (
            <span className="ml-1">· Atualizado: {new Date(lastUpdate).toLocaleDateString("pt-BR")}</span>
          )}
        </span>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Em qual investimento aplicou?</label>
        <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {investmentTypes.map(t => (
              <SelectItem key={t.id} value={t.id}>
                {t.label} — {(t.annualRate * 100).toFixed(2)}% a.a.
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {investmentMonthly > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Investindo <span className="font-bold text-foreground">R$ {investmentMonthly.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês</span> em <span className="font-bold text-foreground">{investmentTypes.find(t => t.id === selectedInvestment)?.label}</span>:
          </p>

          {/* Period tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
            {availablePeriods.map((p, i) => (
              <button
                key={p.months}
                onClick={() => setSelectedPeriodIdx(i)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedPeriodIdx === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {p.label}
              </button>
            ))}
            {!isPremium && (
              <button
                onClick={() => navigate("/planos")}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                🔒 Mais períodos
              </button>
            )}
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-[10px] text-muted-foreground">Investido</p>
              <p className="text-sm font-bold text-foreground">R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-safe/5 rounded-lg p-3 border border-safe/20">
              <p className="text-[10px] text-muted-foreground">Rendimento</p>
              <p className="text-sm font-bold text-safe">+ R$ {interest.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-sm font-bold text-primary">R$ {totalWithInterest.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Adicione valores ao investimento para ver projeções com juros compostos.</p>
      )}
    </div>
  );
}
