import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="text-lg font-bold text-foreground tracking-tight hover:text-accent transition-colors"
        >
          Sony Rep Toolkit
        </Link>
      </div>
    </nav>
  );
}
