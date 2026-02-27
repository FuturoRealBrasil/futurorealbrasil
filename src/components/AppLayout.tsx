import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Target, BookOpen, Zap, CreditCard } from "lucide-react";

const tabs = [
  { path: "/dashboard", icon: BarChart3, label: "Futuro" },
  { path: "/missoes", icon: Target, label: "Missões" },
  { path: "/educacao", icon: BookOpen, label: "Aprender" },
  { path: "/emergencia", icon: Zap, label: "SOS" },
  { path: "/planos", icon: CreditCard, label: "Planos" },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {children}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
