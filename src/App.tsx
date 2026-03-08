import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Missoes from "./pages/Missoes";
import Educacao from "./pages/Educacao";
import Emergencia from "./pages/Emergencia";
import Planos from "./pages/Planos";
import AssinaturaConfirmada from "./pages/AssinaturaConfirmada";
import NotFound from "./pages/NotFound";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import ResetPassword from "./pages/ResetPassword";
import ComoFunciona from "./pages/ComoFunciona";
import VerificarCertificado from "./pages/VerificarCertificado";
import Perfil from "./pages/Perfil";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/missoes" element={<ProtectedRoute><Missoes /></ProtectedRoute>} />
    <Route path="/educacao" element={<ProtectedRoute><Educacao /></ProtectedRoute>} />
    <Route path="/emergencia" element={<ProtectedRoute><Emergencia /></ProtectedRoute>} />
    <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
    <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
    <Route path="/assinatura-confirmada" element={<ProtectedRoute><AssinaturaConfirmada /></ProtectedRoute>} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/como-funciona" element={<ComoFunciona />} />
    <Route path="/termos" element={<Termos />} />
    <Route path="/privacidade" element={<Privacidade />} />
    <Route path="/verificar-certificado" element={<VerificarCertificado />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
