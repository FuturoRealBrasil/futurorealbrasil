import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t px-6 py-10 md:py-14">
      <div className="max-w-sm md:max-w-3xl mx-auto">
        <div className="md:grid md:grid-cols-3 md:gap-8 space-y-6 md:space-y-0">
          {/* Brand */}
          <div>
            <h3 className="text-base font-extrabold text-foreground mb-2">Futuro Real Brasil</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plataforma de planejamento e prevenção financeira familiar.
            </p>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              CNPJ: 55.276.743/0001-80
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              São João de Meriti – RJ, Brasil
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              Contato: Rotinadeumtrabalhador@gmail.com
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <Link to="/termos" className="text-xs font-semibold text-brand-green hover:underline">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-xs font-semibold text-brand-green hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </div>

        <div className="border-t mt-6 pt-4">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Futuro Real Brasil – Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
