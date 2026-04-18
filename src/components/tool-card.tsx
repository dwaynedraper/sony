import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export default function ToolCard({
  title,
  description,
  href,
  icon,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      id={`tool-card-${href.replace(/\//g, "")}`}
      className="group block bg-surface border border-border rounded-xl p-6 shadow-md
                 hover:bg-surface-hover hover:border-accent/50 hover:shadow-lg
                 hover:-translate-y-0.5 transition-all duration-150 ease-in-out"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl" role="img" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h2>
          <p className="mt-1 text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
