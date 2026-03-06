import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function WaitListForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [numero, setNumero] = useState("");
  const [descricao, setDescricao] = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !numero.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSending(true);

    const message = `*Nova solicitação - Futuro Real Brasil*%0A%0A*Nome:* ${encodeURIComponent(nome.trim())}%0A*E-mail:* ${encodeURIComponent(email.trim())}%0A*Número:* ${encodeURIComponent(numero.trim())}%0A*Motivo:* ${encodeURIComponent(descricao.trim() || "Não informado")}`;

    const whatsappUrl = `https://wa.me/5521995612947?text=${message}`;
    window.open(whatsappUrl, "_blank");

    toast.success("Redirecionando para o WhatsApp...");
    setNome("");
    setEmail("");
    setNumero("");
    setDescricao("");
    setSending(false);
  }

  return (
    <div className="mt-10 bg-card rounded-2xl border shadow-sm p-6 animate-fade-up">
      <h2 className="text-lg font-extrabold text-foreground text-center mb-1">
        Fale Conosco
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-5">
        Preencha o formulário e entraremos em contato pelo WhatsApp
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Seu nome *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={100}
          required
        />
        <Input
          type="email"
          placeholder="Seu e-mail *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={200}
          required
        />
        <Input
          placeholder="Seu número (WhatsApp) *"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          maxLength={20}
          inputMode="tel"
          required
        />
        <Textarea
          placeholder="Por que você quer assinar o Futuro Real Brasil?"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          maxLength={500}
          rows={3}
        />
        <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={sending}>
          <Send className="w-4 h-4 mr-2" />
          Enviar pelo WhatsApp
        </Button>
      </form>
    </div>
  );
}
