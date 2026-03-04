import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Heart, Shield, ArrowRight, BarChart3, Target, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Testimonials from "@/components/Testimonials";
import ContentPreview from "@/components/ContentPreview";
import logo from "@/assets/logo-transparent.png";

const AnimatedCounter = ({ target, label, icon }: { target: number; label: string; icon: React.ReactNode }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 md:gap-2">
      {icon}
      <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-brand-green">{count.toLocaleString("pt-BR")}+</span>
      <span className="text-xs md:text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const parallaxRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    navigate(user ? "/dashboard" : "/auth");
  };

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const scrollY = window.scrollY;
      parallaxRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            entry.target.classList.remove("opacity-0", "translate-y-6");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Hero Section with parallax */}
      <div className="relative overflow-hidden bg-primary text-primary-foreground">
        <div ref={parallaxRef} className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)]" />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 md:py-28 lg:py-36 text-center">
          <div className="animate-fade-up">
            <img
              src={logo}
              alt="Futuro Real Brasil"
              className="w-48 md:w-56 mx-auto mb-6 drop-shadow-lg rounded-2xl"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 md:mb-5 animate-fade-up max-w-sm md:max-w-2xl" style={{ animationDelay: "0.15s" }}>
            Educação Financeira{" "}
            <span className="text-brand-gold">Acessível</span>
          </h1>

          <p className="text-base md:text-lg lg:text-xl opacity-90 font-medium leading-relaxed max-w-xs md:max-w-md mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            Antes que a vida te pegue de surpresa,{" "}
            <span className="text-brand-gold font-bold">veja o futuro.</span>
          </p>

          <div className="w-full max-w-sm md:max-w-md space-y-3 md:flex md:space-y-0 md:gap-4 animate-fade-up" style={{ animationDelay: "0.45s" }}>
            <Button
              onClick={handleStart}
              className="w-full md:w-auto md:px-10 h-14 text-base font-bold rounded-xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground shadow-lg"
              size="lg"
            >
              {user ? "Ir para o Dashboard" : "Começar agora"} <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            {!user && (
              <Button
                onClick={() => navigate("/auth")}
                variant="outline"
                className="w-full md:w-auto md:px-10 h-12 text-base font-semibold rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Já tenho conta
              </Button>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L48 36C96 32 192 24 288 28C384 32 480 48 576 52C672 56 768 48 864 40C960 32 1056 24 1152 28C1248 32 1344 48 1392 56L1440 64V80H0V40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </div>

      {/* Animated counters */}
      <div className="px-6 py-8 md:py-12 scroll-reveal opacity-0 translate-y-6">
        <div className="w-full max-w-sm md:max-w-3xl mx-auto grid grid-cols-3 gap-4 md:gap-8 bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
          <AnimatedCounter target={1250} label="Usuários ativos" icon={<Users className="w-5 h-5 text-brand-blue" />} />
          <AnimatedCounter target={52} label="Avaliações" icon={<Heart className="w-5 h-5 text-destructive" />} />
          <AnimatedCounter target={98} label="% Satisfação" icon={<TrendingUp className="w-5 h-5 text-brand-green" />} />
        </div>
      </div>

      {/* Why section with scroll reveal */}
      <div className="px-6 py-10 md:py-16">
        <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-foreground text-center mb-2 scroll-reveal opacity-0 translate-y-6">
          Por que usar o <span className="text-brand-green">Futuro Real</span>?
        </h2>
        <p className="text-sm md:text-base text-muted-foreground text-center mb-6 md:mb-10 max-w-xs md:max-w-lg mx-auto scroll-reveal opacity-0 translate-y-6">
          Ferramentas simples para transformar sua vida financeira
        </p>

        <div className="w-full max-w-sm md:max-w-3xl mx-auto space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          {[
            { icon: TrendingUp, text: "Preveja riscos antes que aconteçam", color: "text-brand-green" },
            { icon: Heart, text: "Proteja quem depende de você", color: "text-destructive" },
            { icon: Shield, text: "Sem julgamento. Só soluções.", color: "text-brand-blue" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm border scroll-reveal opacity-0 translate-y-6"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-sm font-semibold text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid with scroll reveal */}
      <div className="px-6 pb-10 md:pb-16">
        <div className="w-full max-w-sm md:max-w-3xl mx-auto grid grid-cols-3 gap-3 md:gap-6">
          {[
            { icon: BarChart3, label: "Simulações", color: "bg-brand-blue/10 text-brand-blue" },
            { icon: Target, label: "Missões", color: "bg-brand-green/10 text-brand-green" },
            { icon: BookOpen, label: "Educação", color: "bg-brand-gold/10 text-brand-gold" },
          ].map((feat, i) => (
            <div
              key={i}
              className="bg-card border rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm scroll-reveal opacity-0 translate-y-6"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`w-10 h-10 rounded-full ${feat.color} flex items-center justify-center`}>
                <feat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground">{feat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Preview section */}
      <ContentPreview />

      {/* Testimonials section */}
      <div className="scroll-reveal opacity-0 translate-y-6">
        <Testimonials />
      </div>

      {/* Footer */}
      <div className="pb-8 pt-4 text-center mt-auto">
        <p className="text-xs text-muted-foreground">
          🔒 Seus dados ficam seguros. Sem anúncios. Sem julgamento.
        </p>
      </div>
    </div>
  );
};

export default Index;
