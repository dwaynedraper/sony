"use client";

import { useState, useEffect } from "react";
import { basketGenres, dontForgetItems, type GenreDefinition, type BasketItem } from "@/data/basket-genres";

export default function BasketBuilderClient() {
  const [selectedGenreId, setSelectedGenreId] = useState<string>("");
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  const selectedGenre = basketGenres.find(g => g.id === selectedGenreId);

  useEffect(() => {
    if (!selectedGenre) return;

    // Reset rationales when switching genres
    setRationales({});
    
    const allItems = [...selectedGenre.items, ...dontForgetItems];
    
    // Fetch rationales for each item
    allItems.forEach(async (item) => {
      const key = `${selectedGenre.id}-${item.label}`;
      setLoadingItems(prev => ({ ...prev, [key]: true }));
      
      try {
        const res = await fetch("/api/generate-basket-rationale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ genre: selectedGenre.title, item: item.label }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setRationales(prev => ({ ...prev, [key]: data.rationale }));
        }
      } catch (err) {
        console.error("Rationale fetch error:", err);
      } finally {
        setLoadingItems(prev => ({ ...prev, [key]: false }));
      }
    });
  }, [selectedGenreId]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-10">
        <h1 className="text-3xl font-black tracking-tight mb-2">Basket Builder</h1>
        <p className="text-text-secondary">Select a genre to build a tailored gear package with expert sales points.</p>
      </header>

      {/* Genre Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
        {basketGenres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenreId(genre.id)}
            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
              selectedGenreId === genre.id
                ? "bg-foreground text-background border-foreground shadow-lg scale-[1.02]"
                : "bg-surface border-border hover:border-accent hover:bg-surface-hover"
            }`}
          >
            <div className="font-bold text-sm leading-tight">{genre.title}</div>
          </button>
        ))}
      </div>

      {selectedGenre ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-foreground">Recommended Setup</h2>
              <p className="text-xs text-text-secondary uppercase tracking-widest">{selectedGenre.description}</p>
            </div>
            
            <div className="space-y-3">
              {[...selectedGenre.items, ...dontForgetItems].map((item, idx) => {
                const key = `${selectedGenre.id}-${item.label}`;
                return (
                  <div key={idx} className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur-sm transition-all hover:bg-surface">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-foreground">{item.label}</span>
                          <Badge category={item.category} />
                        </div>
                        <div className="min-h-[1.5rem]">
                          {loadingItems[key] ? (
                            <div className="h-4 w-3/4 bg-border/30 animate-pulse rounded" />
                          ) : (
                            <p className="text-sm text-text-secondary leading-relaxed italic">
                              {rationales[key] || "Generating expert tip..."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      item.category === 'must-have' ? 'bg-emerald-500' : 
                      item.category === 'make-it-shine' ? 'bg-blue-500' : 'bg-text-muted'
                    }`} />
                  </div>
                );
              })}
            </div>
          </section>

          <div className="pt-6 border-t border-border flex justify-between items-center">
            <button 
              onClick={() => {
                const text = [...selectedGenre.items, ...dontForgetItems]
                  .map(i => `${i.label}: ${rationales[`${selectedGenre.id}-${i.label}`] || ""}`)
                  .join("\n\n");
                navigator.clipboard.writeText(text);
              }}
              className="px-6 py-3 rounded-full bg-foreground text-background font-bold text-sm hover:opacity-90 transition-all"
            >
              Copy Recommendation Pitch
            </button>
            <button 
              onClick={() => setSelectedGenreId("")}
              className="text-sm font-semibold text-text-secondary hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-bold text-text-secondary">Ready to build?</h3>
          <p className="text-sm text-text-muted">Choose a photography genre above to see the recommended gear.</p>
        </div>
      )}
    </div>
  );
}

function Badge({ category }: { category: BasketItem["category"] }) {
  if (category === "must-have") {
    return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-tighter border border-emerald-500/20">Essential</span>;
  }
  if (category === "make-it-shine") {
    return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/10 text-blue-500 uppercase tracking-tighter border border-blue-500/20">Make it Shine</span>;
  }
  return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-text-muted/10 text-text-muted uppercase tracking-tighter border border-text-muted/20">Don't Forget</span>;
}

