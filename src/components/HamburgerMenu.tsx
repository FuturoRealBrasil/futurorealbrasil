import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, Target, BookOpen, Zap, CreditCard, LogOut, Menu, X, Home } from "lucide-react";

const menuItems = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/dashboard", icon: BarChart3, label: "Futuro" },
  { path: "/missoes", icon: Target, label: "Missões" },
  { path: "/educacao", icon: BookOpen, label: "Aprender" },
  { path: "/emergencia", icon: Zap, label: "SOS" },
  { path: "/planos", icon: CreditCard, label: "Planos" },
];

const HamburgerMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
        aria-label="Menu"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-56 bg-card border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-up">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 border-t transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HamburgerMenu;
