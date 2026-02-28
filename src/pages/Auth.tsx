import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials" ? "Email ou senha incorretos" : error.message);
      } else {
        navigate("/dashboard");
      }
    } else {
      if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, displayName || email);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Entre para ver seu futuro financeiro" : "Comece a proteger seu futuro"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {!isLogin && (
            <div>
              <Label className="text-sm font-semibold text-foreground">Nome</Label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 rounded-xl bg-card mt-1"
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold text-foreground">Email</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-card mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-foreground">Senha</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-card mt-1 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-14 text-base font-bold rounded-xl" size="lg">
            {submitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary font-semibold hover:underline"
          >
            {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 italic">
          "Aqui ninguém julga. Aqui a gente resolve."
        </p>
      </div>
    </div>
  );
};

export default Auth;
