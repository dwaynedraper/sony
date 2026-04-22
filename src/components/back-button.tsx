import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ 
  href = "/", 
  label = "Back to Tools",
  className = "mb-8"
}: BackButtonProps) {
  return (
    <Link 
      href={href} 
      className={`inline-flex items-center text-sm font-bold text-text-muted hover:text-accent transition-colors ${className}`}
    >
      <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </Link>
  );
}
