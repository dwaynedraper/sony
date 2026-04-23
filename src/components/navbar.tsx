import Link from "next/link";
import { getSession } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function Navbar() {
  const session = await getSession();

  return (
    <nav className="w-full border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="text-lg font-bold text-foreground tracking-tight hover:text-accent transition-colors"
        >
          Sony Rep Toolkit
        </Link>
        
        <Link
          href="/all-issues"
          className="text-xs font-medium text-text-secondary hover:text-foreground transition-colors ml-4"
        >
          See all store issues
        </Link>

        {session && (
          <form action={logout} className="ml-auto">
            <button
              type="submit"
              className="text-xs text-text-muted hover:text-foreground transition-colors"
              title={session.email}
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
