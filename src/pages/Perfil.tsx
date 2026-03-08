import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

const Perfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, whatsapp, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setWhatsapp(data.whatsapp || "");
          setAvatarUrl(data.avatar_url);
        }
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar imagem");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = urlData.publicUrl + "?t=" + Date.now();

    await supabase
      .from("profiles")
      .update({ avatar_url: newUrl } as any)
      .eq("user_id", user.id);

    setAvatarUrl(newUrl);
    setUploading(false);
    toast.success("Foto atualizada!");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, whatsapp } as any)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Perfil atualizado!");
    }
    setSaving(false);
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-[hsl(213,40%,12%)] via-[hsl(213,35%,18%)] to-[hsl(160,30%,15%)]">
        <div className="max-w-md mx-auto px-6 py-8">
          <button onClick={() => navigate(-1)} className="text-primary-foreground/70 hover:text-primary-foreground mb-6">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-2xl font-extrabold text-primary-foreground mb-8">Meu Perfil</h1>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-brand-green">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-green/80 transition-colors">
                <Camera className="w-4 h-4 text-primary-foreground" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            {uploading && <p className="text-xs text-primary-foreground/50 mt-2">Enviando...</p>}
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-semibold text-primary-foreground/90">Nome</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                className="h-12 rounded-xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-primary-foreground/90">Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="h-12 rounded-xl bg-white/5 border-white/10 text-primary-foreground/50 mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-primary-foreground/90">Celular / WhatsApp</Label>
              <Input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="h-12 rounded-xl bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/40 mt-1"
                inputMode="tel"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-14 text-base font-bold rounded-xl bg-brand-green hover:bg-brand-green/90 text-primary-foreground shadow-lg mt-4"
              size="lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Perfil;
