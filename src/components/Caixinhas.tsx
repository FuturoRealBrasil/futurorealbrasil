import { useState, useRef } from "react";
import { useCaixinhas } from "@/hooks/useCaixinhas";
import { Plus, Pencil, Trash2, PiggyBank, ImagePlus, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Caixinhas() {
  const { caixinhas, loading, createCaixinha, updateCaixinha, deleteCaixinha, addToCaixinha } = useCaixinhas();
  const [showCreate, setShowCreate] = useState(false);
  const [nome, setNome] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositValor, setDepositValor] = useState("");

  async function handleCreate() {
    if (!nome.trim()) { toast.error("Informe o nome da caixinha"); return; }
    setSaving(true);
    await createCaixinha(nome.trim(), imageFile || undefined);
    setNome(""); setImageFile(null); setShowCreate(false);
    if (fileRef.current) fileRef.current.value = "";
    setSaving(false);
    toast.success("Caixinha criada!");
  }

  async function handleEdit(id: string) {
    if (!editNome.trim()) { toast.error("Informe o nome"); return; }
    setSaving(true);
    await updateCaixinha(id, editNome.trim(), editImageFile || undefined);
    setEditId(null); setEditImageFile(null);
    setSaving(false);
    toast.success("Caixinha atualizada!");
  }

  async function handleDeposit(id: string) {
    const v = parseFloat(depositValor.replace(",", "."));
    if (isNaN(v) || v <= 0) { toast.error("Valor inválido"); return; }
    setSaving(true);
    await addToCaixinha(id, v);
    setDepositId(null); setDepositValor("");
    setSaving(false);
    toast.success("Valor adicionado!");
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja apagar esta caixinha?")) return;
    await deleteCaixinha(id);
    toast.success("Caixinha apagada!");
  }

  if (loading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-brand-gold" /> Caixinhas
        </h2>
        <button onClick={() => setShowCreate(!showCreate)} className="text-primary hover:text-primary/80">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showCreate && (
        <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3 animate-fade-up">
          <Input placeholder="Nome da caixinha" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={50} />
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <ImagePlus className="w-4 h-4" />
            <span>{imageFile ? imageFile.name : "Adicionar imagem"}</span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={saving} className="flex-1">
              {saving ? "Salvando..." : "Criar"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowCreate(false); setNome(""); setImageFile(null); }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {caixinhas.length === 0 && !showCreate && (
        <p className="text-sm text-muted-foreground italic">Nenhuma caixinha criada. Crie uma para guardar dinheiro!</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {caixinhas.map((cx) => (
          <div key={cx.id} className="bg-card rounded-xl border shadow-sm overflow-hidden">
            {editId === cx.id ? (
              <div className="p-3 space-y-2">
                <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Nome" maxLength={50} />
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>{editImageFile ? editImageFile.name : "Trocar imagem"}</span>
                  <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} />
                </label>
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => handleEdit(cx.id)} disabled={saving} className="flex-1 h-8 text-xs">
                    <Check className="w-3 h-3 mr-1" /> Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="h-8 text-xs">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {cx.imagem_url ? (
                  <div className="w-full h-20 bg-muted">
                    <img src={cx.imagem_url} alt={cx.nome} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-20 bg-primary/10 flex items-center justify-center">
                    <PiggyBank className="w-8 h-8 text-primary/40" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-bold text-foreground truncate">{cx.nome}</p>
                  <p className="text-lg font-black text-brand-green mt-1">
                    R$ {Number(cx.valor_atual).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>

                  {depositId === cx.id ? (
                    <div className="mt-2 space-y-2">
                      <Input placeholder="Valor (R$)" value={depositValor} onChange={(e) => setDepositValor(e.target.value)} inputMode="decimal" className="h-8 text-sm" />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => handleDeposit(cx.id)} disabled={saving} className="flex-1 h-7 text-xs">
                          Depositar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDepositId(null)} className="h-7 text-xs">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-2">
                      <button onClick={() => setDepositId(cx.id)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Depositar
                      </button>
                      <div className="ml-auto flex gap-1">
                        <button onClick={() => { setEditId(cx.id); setEditNome(cx.nome); }} className="text-muted-foreground hover:text-primary p-1">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(cx.id)} className="text-muted-foreground hover:text-destructive p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
