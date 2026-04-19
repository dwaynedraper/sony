import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: {
    text: string;
    colorClass: string;
  };
  disclaimer?: string;
}

export default function ToolCard({
  title,
  description,
  href,
  icon,
  badge,
  disclaimer,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      id={`tool-card-${href.replace(/\//g, "")}`}
      className="group flex flex-col justify-between bg-surface border border-border rounded-xl p-6 shadow-md
                 hover:bg-surface-hover hover:border-accent/50 hover:shadow-lg
                 hover:-translate-y-0.5 transition-all duration-150 ease-in-out h-full"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl flex-shrink-0" role="img" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1">
          {badge && (
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${badge.colorClass}`}>
              {badge.text}
            </div>
          )}
          <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h2>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {disclaimer && (
        <div className="mt-4 pt-3 border-t border-border-light/50 text-[0.65rem] text-text-muted italic">
          {disclaimer}
        </div>
      )}
    </Link>
  );
}
