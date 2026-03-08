import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, Target, BookOpen, Zap, CreditCard, LogOut, Menu, X, Home, UserCircle } from "lucide-react";

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
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/");
  };

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="relative z-50">
      const isHome = location.pathname === "/";
      const iconColor = isHome
        ? "text-white hover:text-white/80 hover:bg-white/10"
        : "text-[hsl(0,0%,0%)] hover:text-[hsl(0,0%,20%)] hover:bg-black/10";

      return (
        <button
          onClick={() => setOpen(!open)}
          className={`p-2 rounded-lg transition-colors ${iconColor}`}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      );
    })()}

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute right-0 top-12 w-56 border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-up ${user ? "bg-[hsl(0,0%,5%)] border-white/10" : "bg-card"}`}>
            
            {/* User profile header */}
            {user && profile && (
              <button
                onClick={() => handleNav("/perfil")}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <Avatar className="w-9 h-9 border-2 border-brand-green">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold text-white truncate">{profile.display_name || "Meu Perfil"}</p>
                  <p className="text-[10px] text-white/50">Ver perfil</p>
                </div>
              </button>
            )}

            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? user ? "bg-white/10 text-brand-gold" : "bg-primary/10 text-primary"
                      : user ? "text-white/80 hover:bg-white/5" : "text-foreground hover:bg-muted"
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
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 border-t border-white/10 transition-colors"
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
