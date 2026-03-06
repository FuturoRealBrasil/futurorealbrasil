import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-transparent.png";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? false : true;
  const [isLogin, setIsLogin] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Digite seu email primeiro");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    }
  };

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dark gradient background matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)]" />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 flex flex-col px-6 py-8 min-h-screen">
        <button onClick={() => navigate("/")} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center mb-8 animate-fade-up">
            <img src={logo} alt="Futuro Real Brasil" className="w-52 mx-auto mb-4 drop-shadow-lg" />
            <h1 className="text-2xl font-extrabold text-primary-foreground">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="text-sm text-primary-foreground/70 mt-1">
              {isLogin ? "Entre para ver seu futuro financeiro" : "Comece a proteger seu futuro"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {!isLogin && (
              <div>
                <Label className="text-sm font-semibold text-primary-foreground/90">Nome</Label>
                <Input type="text" placeholder="Seu nome" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-12 rounded-xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 mt-1" />
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-primary-foreground/90">Email</Label>
              <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 mt-1" required />
            </div>

            <div>
              <Label className="text-sm font-semibold text-primary-foreground/90">Senha</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 mt-1 pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/50">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-xs text-brand-gold hover:underline">
                  Esqueci minha senha
                </button>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full h-14 text-base font-bold rounded-xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground shadow-lg" size="lg">
              {submitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-brand-gold font-semibold hover:underline">
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
            </button>
          </div>

          <p className="text-center text-xs text-primary-foreground/50 mt-8 italic">
            "Aqui ninguém julga. Aqui a gente resolve."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
