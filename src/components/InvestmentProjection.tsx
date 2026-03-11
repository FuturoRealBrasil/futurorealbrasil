import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const investmentTypes = [
  { id: "cdb", label: "CDB (100% CDI)", annualRate: 0.105 },
  { id: "cdb_120", label: "CDB (120% CDI)", annualRate: 0.126 },
  { id: "tesouro_selic", label: "Tesouro Selic", annualRate: 0.105 },
  { id: "lci", label: "LCI (90% CDI)", annualRate: 0.0945 },
  { id: "lca", label: "LCA (90% CDI)", annualRate: 0.0945 },
  { id: "tesouro_ipca", label: "Tesouro IPCA+ (6%+IPCA)", annualRate: 0.105 },
];

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
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(5); // default 6 months
  const selectedRate = investmentTypes.find(t => t.id === selectedInvestment)?.annualRate || 0.105;
  const period = periods[selectedPeriodIdx];

  // Free users: only first 6 periods (1-6 months)
  const availablePeriods = isPremium ? periods : periods.slice(0, 6);

  const totalInvested = investmentMonthly * period.months;
  const interest = compoundInterest(investmentMonthly, selectedRate, period.months);
  const totalWithInterest = totalInvested + interest;

  return (
    <div className="bg-card rounded-2xl p-5 border shadow-sm mb-6 animate-fade-up">
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-brand-green" /> Projeção de Investimento
      </h2>

      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Em qual investimento aplicou?</label>
        <Select value={selectedInvestment} onValueChange={setSelectedInvestment}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {investmentTypes.map(t => (
              <SelectItem key={t.id} value={t.id}>
                {t.label} — {(t.annualRate * 100).toFixed(1)}% a.a.
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
