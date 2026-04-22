import { SpecItem } from "@/data/cage-fights";

interface SpecComparisonTableProps {
  specs: SpecItem[];
  sonyModel: string;
  competitorModel: string;
}

export default function SpecComparisonTable({
  specs,
  sonyModel,
  competitorModel,
}: SpecComparisonTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-surface/50 shadow-inner">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="py-4 px-6 text-left text-xs font-black uppercase tracking-widest text-text-muted">Capability</th>
              <th className="py-4 px-6 text-center text-sm font-black text-foreground">{sonyModel}</th>
              <th className="py-4 px-6 text-center text-sm font-bold text-text-secondary">{competitorModel}</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                {/* Simplified Title */}
                <td className="py-4 px-6">
                  <div className="text-sm font-bold text-foreground">{spec.label}</div>
                  {spec.description && (
                    <div className="text-[0.7rem] text-text-muted mt-0.5 max-w-[200px]">
                      {spec.description}
                    </div>
                  )}
                </td>

                {/* Sony Column */}
                <td className={`py-4 px-6 text-center text-sm font-medium relative
                  ${spec.winner === "sony" ? "bg-green-500/15 text-green-400 border-x border-green-500/20" : 
                    spec.winner === "competitor" ? "bg-red-500/10 text-red-400/80" : 
                    spec.winner === "question" ? "bg-accent/10 text-accent/80" : ""}`}>
                  {spec.sonyValue}
                  {spec.winner === "question" && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full text-[0.6rem] font-black text-background flex items-center justify-center z-20 shadow-sm">
                      ?
                    </div>
                  )}
                </td>

                {/* Competitor Column */}
                <td className={`py-4 px-6 text-center text-sm relative
                  ${spec.winner === "competitor" ? "bg-green-500/15 text-green-400 border-x border-green-500/20" : 
                    spec.winner === "sony" ? "bg-red-500/10 text-red-400/80" : 
                    spec.winner === "question" ? "bg-accent/10 text-accent/80" : ""}`}>
                  {spec.competitorValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-surface/80 border-t border-border flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500/40 border border-green-500/60" />
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">Superior Advantage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">Technical Limitation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-[0.4rem] font-bold text-accent">?</div>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">Physics Reality</span>
        </div>
      </div>
    </div>
  );
}
