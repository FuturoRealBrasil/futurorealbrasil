import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CertificateInfo {
  user_name: string;
  completion_date: string;
  study_hours_total: number;
  verification_code: string;
  modules_completed: string[];
  missions_completed: string[];
}

const moduleLabels: Record<string, string> = {
  iniciante: "Módulo 1 - Iniciante",
  organizado: "Módulo 2 - Organizado",
  investidor: "Módulo 3 - Investidor",
  independente: "Módulo 4 - Independente",
};

const VerificarCertificado = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get("code") || "";
  const [code, setCode] = useState(codeParam);
  const [cert, setCert] = useState<CertificateInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codeParam) search(codeParam);
  }, [codeParam]);

  async function search(searchCode?: string) {
    const c = (searchCode || code).trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    setNotFound(false);
    setCert(null);

    const { data, error } = await supabase
      .from("certificates")
      .select("user_name, completion_date, study_hours_total, verification_code, modules_completed, missions_completed")
      .eq("verification_code", c)
      .single();

    if (error || !data) {
      setNotFound(true);
    } else {
      setCert(data as CertificateInfo);
    }
    setLoading(false);
  }

  function formatStudyTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border shadow-lg p-6 max-w-md w-full relative">
        <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={() => navigate(-1)}>
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-extrabold text-foreground text-center mb-1">Verificar Certificado</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Futuro Real Brasil</p>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Código de verificação"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono tracking-wider"
          />
          <Button onClick={() => search()} disabled={loading} size="icon">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {loading && <p className="text-center text-muted-foreground text-sm">Verificando...</p>}

        {notFound && (
          <div className="text-center p-4 bg-destructive/10 rounded-xl border border-destructive/20">
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
            <p className="font-bold text-destructive">Certificado não encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">Verifique o código e tente novamente.</p>
          </div>
        )}

        {cert && (
          <div className="space-y-4 animate-fade-up">
            <div className="text-center p-4 bg-safe/10 rounded-xl border border-safe/20">
              <CheckCircle2 className="w-10 h-10 text-safe mx-auto mb-2" />
              <p className="font-bold text-safe text-lg">Certificado Válido</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Nome:</span><span className="font-bold text-foreground">{cert.user_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Curso:</span><span className="font-bold text-foreground">Gestão Financeira Familiar</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Carga horária:</span><span className="font-bold text-foreground">{formatStudyTime(cert.study_hours_total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Conclusão:</span><span className="font-bold text-foreground">{new Date(cert.completion_date).toLocaleDateString("pt-BR")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Código:</span><span className="font-mono font-bold text-foreground">{cert.verification_code}</span></div>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">Módulos concluídos:</p>
              <div className="space-y-1">
                {(cert.modules_completed || []).map((m) => (
                  <p key={m} className="text-xs text-foreground">✓ {moduleLabels[m] || m}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificarCertificado;
