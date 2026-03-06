import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)] text-white px-6 py-10 md:py-14">
      <div className="max-w-sm md:max-w-3xl mx-auto">
        <div className="md:grid md:grid-cols-3 md:gap-8 space-y-6 md:space-y-0">
          {/* Brand */}
          <div>
            <h3 className="text-base font-extrabold mb-2">Futuro Real Brasil</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Plataforma de planejamento e prevenção financeira familiar.
            </p>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs text-white/70 leading-relaxed">
              CNPJ: 55.276.743/0001-80
            </p>
            <p className="text-xs text-white/70 leading-relaxed mt-1">
              São João de Meriti – RJ, Brasil
            </p>
            <p className="text-xs text-white/70 leading-relaxed mt-2">
              Contato: Rotinadeumtrabalhador@gmail.com
            </p>
          </div>

          {/* Links + Trust Seal */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Link to="/termos" className="text-xs font-semibold text-brand-gold hover:underline">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="text-xs font-semibold text-brand-gold hover:underline">
                Política de Privacidade
              </Link>
            </div>

            {/* Trust Seal */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">🛡️</span>
                <span className="text-xs font-bold">Plataforma segura</span>
              </div>
              <p className="text-[10px] text-white/60 flex items-center gap-1">
                <Check className="w-3 h-3 text-brand-green shrink-0" /> Dados protegidos
              </p>
              <p className="text-[10px] text-white/60 flex items-center gap-1">
                <Check className="w-3 h-3 text-brand-green shrink-0" /> Pagamento seguro
              </p>
              <p className="text-[10px] text-white/60 flex items-center gap-1">
                <Check className="w-3 h-3 text-brand-green shrink-0" /> Conforme LGPD
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-4">
          <p className="text-xs text-white/50 text-center">
            © 2026 Futuro Real Brasil – Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
