import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Heart, Shield, ArrowRight, BarChart3, Target, BookOpen, Users, ChevronDown, CheckCircle2 } from "lucide-react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Testimonials from "@/components/Testimonials";
import ContentPreview from "@/components/ContentPreview";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import WaitListForm from "@/components/WaitListForm";
import logo from "@/assets/logo-transparent.png";
import familiesImg from "@/assets/families-celebrating.jpg";

// Base date: March 5, 2026
const BASE_DATE = new Date(2026, 2, 5);
const BASE_USERS = 1250;
const BASE_REVIEWS = 552;
const BASE_SATISFACTION = 98;

function getDaysSinceBase() {
  const now = new Date();
  const diff = now.getTime() - BASE_DATE.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

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
  const [, setShowHowItWorks] = useState(false);

  const handleStart = () => {
    navigate(user ? "/planos" : "/auth?mode=signup");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;
      const scrollY = window.scrollY;
      parallaxRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      {/* Hero Section */}
      <div className="relative overflow-hidden text-primary-foreground">
        <img src={familiesImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[hsl(213,40%,12%)]/80" />

        <div className="absolute top-4 right-4 z-20">
          <HamburgerMenu />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 md:py-28 lg:py-36 text-center">
          <div className="animate-fade-up">
            <img src={logo} alt="Futuro Real Brasil" className="w-56 md:w-64 mx-auto mb-6 drop-shadow-lg rounded-2xl" style={{ mixBlendMode: "multiply" }} />
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 md:mb-5 animate-fade-up max-w-sm md:max-w-2xl" style={{ animationDelay: "0.15s" }}>
            Gestão Financeira{" "}
            <span className="text-brand-gold">Familiar</span>
          </h1>

          <p className="text-sm md:text-lg lg:text-xl opacity-90 font-medium leading-relaxed max-w-xs md:max-w-lg mx-auto mb-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            Organize sua vida financeira de forma simples.
            Sem planilhas complicadas. Sem precisar entender de investimentos.
          </p>
          <p className="text-xs md:text-base opacity-75 leading-relaxed max-w-xs md:max-w-md mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.35s" }}>
            Porque quando uma pessoa aprende a cuidar melhor do seu dinheiro, ela muda não apenas sua vida — mas o futuro da sua família.
          </p>

          <div className="w-full max-w-sm md:max-w-md space-y-3 md:flex md:space-y-0 md:gap-4 animate-fade-up" style={{ animationDelay: "0.45s" }}>
            <Button
              onClick={handleStart}
              className="w-full md:w-auto md:px-10 h-14 text-base font-bold rounded-xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground shadow-lg"
              size="lg"
            >
              Assinar Agora <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            {!user && (
              <Button
                onClick={() => navigate("/auth?mode=login")}
                variant="outline"
                className="w-full md:w-auto md:px-10 h-12 text-base font-semibold rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Já tenho conta
              </Button>
            )}
          </div>

          {/* Ver como funciona */}
          <button
            onClick={() => navigate("/como-funciona")}
            className="mt-4 flex items-center gap-2 text-sm text-brand-gold font-semibold hover:underline animate-fade-up"
            style={{ animationDelay: "0.55s" }}
          >
            <ChevronDown className="w-4 h-4" /> Ver como funciona
          </button>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L48 36C96 32 192 24 288 28C384 32 480 48 576 52C672 56 768 48 864 40C960 32 1056 24 1152 28C1248 32 1344 48 1392 56L1440 64V80H0V40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </div>

      {/* Problem statement section */}
      <div className="px-6 py-10 md:py-16">
        <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-foreground text-center mb-2 scroll-reveal opacity-0 translate-y-6">
          A maioria das famílias brasileiras <span className="text-destructive">vive assim</span>:
        </h2>
        <div className="w-full max-w-sm md:max-w-lg mx-auto mt-6 space-y-3 scroll-reveal opacity-0 translate-y-6">
          {[
            "Salário acaba antes do mês",
            "Dívidas no cartão",
            "Nenhum dinheiro guardado",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              <span className="text-destructive text-lg">•</span>
              <span className="text-sm font-semibold text-foreground">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-sm md:text-base text-brand-green font-bold text-center mt-6 max-w-xs md:max-w-lg mx-auto scroll-reveal opacity-0 translate-y-6">
          O Futuro Real Brasil resolve isso com um método simples.
        </p>
      </div>

      {/* Why section */}
      <div className="px-6 pb-10 md:pb-16">
        <div className="w-full max-w-sm md:max-w-3xl mx-auto space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          {[
            { icon: TrendingUp, text: "Preveja riscos antes que aconteçam", color: "text-brand-green" },
            { icon: Heart, text: "Proteja quem depende de você", color: "text-destructive" },
            { icon: Shield, text: "Sem julgamento. Só soluções.", color: "text-brand-blue" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm border scroll-reveal opacity-0 translate-y-6" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-sm font-semibold text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div className="px-6 pb-10 md:pb-16">
        <div className="w-full max-w-sm md:max-w-3xl mx-auto grid grid-cols-3 gap-3 md:gap-6">
          {[
            { icon: BarChart3, label: "Simulações", color: "bg-brand-blue/10 text-brand-blue" },
            { icon: Target, label: "Missões", color: "bg-brand-green/10 text-brand-green" },
            { icon: BookOpen, label: "Educação", color: "bg-brand-gold/10 text-brand-gold" },
          ].map((feat, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm scroll-reveal opacity-0 translate-y-6" style={{ transitionDelay: `${i * 100}ms` }}>
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

      {/* Animated counters - ABOVE testimonials */}
      <div className="px-6 py-8 md:py-12 scroll-reveal opacity-0 translate-y-6">
        <div className="w-full max-w-sm md:max-w-3xl mx-auto grid grid-cols-3 gap-4 md:gap-8 bg-card border rounded-2xl p-6 md:p-10 shadow-sm">
          <AnimatedCounter target={BASE_USERS + getDaysSinceBase() * 3} label="Usuários ativos" icon={<Users className="w-5 h-5 text-brand-blue" />} />
          <AnimatedCounter target={BASE_REVIEWS + getDaysSinceBase() * 3} label="Avaliações" icon={<Heart className="w-5 h-5 text-destructive" />} />
          <AnimatedCounter target={Math.min(100, BASE_SATISFACTION + getDaysSinceBase() * 3)} label="% Satisfação" icon={<TrendingUp className="w-5 h-5 text-brand-green" />} />
        </div>
      </div>

      {/* Testimonials section */}
      <div id="depoimentos" className="scroll-reveal opacity-0 translate-y-6">
        <Testimonials />
      </div>

      {/* Waitlist Form */}
      <div className="px-6 pb-10 max-w-sm md:max-w-3xl mx-auto">
        <WaitListForm />
      </div>

      {/* How it works modal */}
      <HowItWorks open={showHowItWorks} onClose={() => setShowHowItWorks(false)} />

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
