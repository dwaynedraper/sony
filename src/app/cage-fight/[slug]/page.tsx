import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import SpecComparisonTable from "@/components/spec-comparison-table";
import CopyPitchButton from "@/components/copy-pitch-button";
import BackButton from "@/components/back-button";
import { cageFights } from "@/data/cage-fights";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CageFightPage({ params }: PageProps) {
  const { slug } = await params;
  const fight = cageFights.find((f) => f.slug === slug);

  if (!fight) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <BackButton />

        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded text-[0.65rem] font-black uppercase tracking-[0.2em] text-accent mb-4">
            Official Cage Fight
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-4 italic">
            {fight.sonyModel} <span className="text-text-muted not-italic text-2xl mx-2">vs</span> {fight.competitorBrand} {fight.competitorModel}
          </h1>
          <p className="text-xl text-text-secondary font-medium leading-relaxed">
            {fight.sonyHighlight}
          </p>
        </div>

        {/* Hype vs Reality Section */}
        <section className="mb-12 bg-surface/30 border border-border/50 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="text-8xl font-black italic">HYPE</span>
          </div>
          
          <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm text-accent">!</span>
            The Hype vs. The Reality
          </h2>
          
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <p className="text-text-secondary leading-relaxed mb-4">
                {fight.hypeExplanation}
              </p>
              {fight.hypeSource && (
                <div className="text-[0.7rem] font-bold text-accent/60 uppercase tracking-widest">
                  Source: {fight.hypeSource}
                </div>
              )}
            </div>
            <div className="md:col-span-2 bg-surface/50 border border-border rounded-xl p-6 flex flex-col justify-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">Sales Tip</h3>
              <p className="text-sm text-text-secondary italic leading-relaxed">
                "Acknowledging the Canon's 'vibe' is fine, but remind the customer that a blurry photo kills the vibe instantly. Only Sony guarantees the shot is in focus."
              </p>
            </div>
          </div>
        </section>

        {/* Spec Table */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground">Technical Knockout</h2>
            <div className="hidden sm:block text-[0.6rem] font-bold text-text-muted uppercase tracking-widest">
              Live Comparison Data
            </div>
          </div>
          <SpecComparisonTable 
            specs={fight.specs} 
            sonyModel={fight.sonyModel} 
            competitorModel={fight.competitorModel} 
          />
        </section>

        {/* Verdict */}
        <section className="bg-gradient-to-br from-surface to-surface-hover border border-accent/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Sony Logo Accent or Symbol */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-accent mb-6">The Verdict</h2>
            <p className="text-lg text-foreground font-bold leading-relaxed mb-8 italic">
              "{fight.verdict}"
            </p>
            <div className="h-1 w-20 bg-accent mx-auto rounded-full mb-8" />
            <CopyPitchButton 
              pitch={fight.salesPitch} 
            />
          </div>
        </section>
      </main>
    </>
  );
}
