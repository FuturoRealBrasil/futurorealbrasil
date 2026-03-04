import { useState } from "react";
import { Star, Camera, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewForm = ({ open, onOpenChange }: ReviewFormProps) => {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user || !nome.trim()) {
      toast.error("Preencha seu nome para enviar a avaliação.");
      return;
    }

    setLoading(true);
    try {
      let foto_url: string | null = null;

      if (foto) {
        const ext = foto.name.split(".").pop();
        const path = `reviews/${user.id}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, foto);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          foto_url = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        nome: nome.trim(),
        nota,
        comentario: comentario.trim() || null,
        foto_url,
      });

      if (error) throw error;

      toast.success("Obrigado pela sua avaliação! 🎉");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-extrabold">Deixe sua avaliação ⭐</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Conte como o Futuro Real está ajudando você!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Photo upload */}
          <div className="flex justify-center">
            <label className="cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-brand-green/40 bg-muted flex items-center justify-center group-hover:border-brand-green transition-colors">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
              <p className="text-[10px] text-center text-muted-foreground mt-1">Sua foto</p>
            </label>
          </div>

          {/* Name */}
          <Input
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={50}
            className="rounded-xl"
          />

          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onMouseEnter={() => setHoverStar(i)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => setNota(i)}
                className="transition-transform hover:scale-125 active:scale-95"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    i <= (hoverStar || nota)
                      ? "fill-brand-gold text-brand-gold"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {nota === 1 && "Precisa melhorar"}
            {nota === 2 && "Razoável"}
            {nota === 3 && "Bom"}
            {nota === 4 && "Muito bom!"}
            {nota === 5 && "Excelente! 🔥"}
          </p>

          {/* Comment */}
          <Textarea
            placeholder="Conte sua experiência (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            rows={3}
            className="rounded-xl resize-none"
          />

          <Button
            className="w-full h-12 rounded-xl font-bold bg-brand-green hover:bg-brand-green/90"
            onClick={handleSubmit}
            disabled={loading || !nome.trim()}
          >
            {loading ? "Enviando..." : "Enviar avaliação"} <Send className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
