import Link from "next/link";
import { CageFight } from "@/data/cage-fights";

interface CageFightCardProps {
  fight: CageFight;
}

export default function CageFightCard({ fight }: CageFightCardProps) {
  return (
    <Link
      href={`/cage-fight/${fight.slug}`}
      className="group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-md
                 hover:border-accent/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
    >
      {/* Background Gradient Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-colors" />

      <div className="p-6 flex flex-col h-full z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-accent/80 px-2 py-1 bg-accent/10 rounded">
            Cage Fight
          </span>
          <span className="text-2xl" role="img" aria-hidden="true">🥊</span>
        </div>

        <div className="flex-1">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="text-center w-full">
              <h2 className="text-xl font-black text-foreground group-hover:text-accent transition-colors leading-tight">
                {fight.sonyModel}
              </h2>
              <div className="flex items-center justify-center my-1">
                <div className="h-px flex-1 bg-border-light/30"></div>
                <span className="mx-3 text-[0.6rem] font-black italic text-text-muted">VS</span>
                <div className="h-px flex-1 bg-border-light/30"></div>
              </div>
              <h3 className="text-lg font-bold text-text-secondary/80 leading-tight">
                {fight.competitorBrand} {fight.competitorModel}
              </h3>
            </div>
          </div>

          <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-3">
            {fight.sonyHighlight}
          </p>
        </div>

        <div className="mt-6 flex items-center text-xs font-bold text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          View Breakdown
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
