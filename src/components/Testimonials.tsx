import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, X, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  nome: string;
  foto_url: string | null;
  nota: number;
  comentario: string | null;
  created_at: string;
}

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i <= count ? "fill-brand-gold text-brand-gold" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) setReviews(data);
    };
    fetchReviews();
  }, []);

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < reviews.length - 1) setSelectedIndex(selectedIndex + 1);
  };

  const selected = selectedIndex !== null ? reviews[selectedIndex] : null;

  if (reviews.length === 0) return null;

  return (
    <div className="px-6 py-10">
      <h2 className="text-lg font-extrabold text-foreground text-center mb-2">
        O que dizem nossos <span className="text-brand-green">usuários</span>
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs mx-auto">
        Mais de {reviews.length} pessoas já transformaram sua vida financeira
      </p>

      {/* Horizontal scroll of avatars */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide max-w-sm mx-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reviews.map((review, i) => (
          <button
            key={review.id}
            onClick={() => setSelectedIndex(i)}
            className="flex flex-col items-center gap-1.5 shrink-0 snap-center transition-transform hover:scale-105 active:scale-95"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-green/30 shadow-md bg-muted">
              {review.foto_url ? (
                <img src={review.foto_url} alt={review.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-brand-green">
                  {review.nome.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <Stars count={review.nota} />
            <span className="text-[10px] text-muted-foreground font-medium max-w-[70px] truncate">
              {review.nome.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Featured review cards - show first 3 */}
      <div className="max-w-sm mx-auto mt-4 space-y-3">
        {reviews.slice(0, 3).map((review, i) => (
          <div
            key={review.id}
            onClick={() => setSelectedIndex(i)}
            className="bg-card border rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow animate-fade-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                {review.foto_url ? (
                  <img src={review.foto_url} alt={review.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-brand-green">
                    {review.nome.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-foreground">{review.nome}</span>
                  <Stars count={review.nota} />
                </div>
                {review.comentario && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    <Quote className="w-3 h-3 inline mr-1 text-brand-gold" />
                    {review.comentario}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setSelectedIndex(0)}
          className="block mx-auto mt-4 text-sm font-semibold text-brand-green hover:underline"
        >
          Ver todos os {reviews.length} depoimentos →
        </button>
      )}

      {/* Full review modal with navigation */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
          {selected && (
            <div className="relative">
              {/* Photo area */}
              <div className="bg-gradient-to-b from-primary to-brand-blue p-6 pb-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-foreground/20 shadow-lg bg-muted mb-3">
                  {selected.foto_url ? (
                    <img src={selected.foto_url} alt={selected.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {selected.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-primary-foreground">{selected.nome}</h3>
                <div className="mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i <= selected.nota ? "fill-brand-gold text-brand-gold" : "text-primary-foreground/30"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="p-5 -mt-4 bg-background rounded-t-2xl relative">
                {selected.comentario && (
                  <p className="text-sm text-foreground leading-relaxed">
                    <Quote className="w-4 h-4 inline mr-1 text-brand-gold" />
                    {selected.comentario}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {selectedIndex !== null && `${selectedIndex + 1} de ${reviews.length} depoimentos`}
                </p>
              </div>

              {/* Navigation arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 left-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/40 text-primary-foreground h-8 w-8"
                  onClick={handlePrev}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/40 text-primary-foreground h-8 w-8"
                  onClick={handleNext}
                  disabled={selectedIndex === reviews.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testimonials;
