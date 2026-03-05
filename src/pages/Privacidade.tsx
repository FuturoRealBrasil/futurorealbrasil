import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Privacidade = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)] px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-primary-foreground/70 hover:text-primary-foreground mb-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-primary-foreground">Política de Privacidade</h1>
          <p className="text-sm text-primary-foreground/60 mt-1">Futuro Real Brasil</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>O Futuro Real Brasil respeita a privacidade e a segurança das informações de seus usuários.</p>
          
          <p>As informações fornecidas pelos usuários são utilizadas exclusivamente para melhorar a experiência na plataforma e oferecer análises financeiras personalizadas.</p>

          <p className="font-semibold text-foreground">Os dados coletados podem incluir:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Nome</li>
            <li>Email</li>
            <li>Informações financeiras inseridas voluntariamente pelo usuário</li>
            <li>Dados de uso da plataforma</li>
          </ul>

          <p>O Futuro Real Brasil <strong className="text-foreground">não vende, não compartilha e não comercializa</strong> dados pessoais com terceiros.</p>

          <p>Todas as informações são armazenadas utilizando padrões modernos de segurança digital.</p>

          <p>Caso o usuário conecte sua conta bancária por meio de sistemas autorizados pelo Banco Central do Brasil, o compartilhamento de dados ocorrerá somente com autorização explícita do usuário, seguindo as normas do Open Finance Brasil.</p>

          <p>Os dados são tratados conforme a <strong className="text-foreground">Lei Geral de Proteção de Dados</strong>.</p>

          <p>Usuários podem solicitar exclusão de seus dados a qualquer momento através do email: <strong className="text-foreground">privacidade@futurorealbrasil.com</strong></p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacidade;
