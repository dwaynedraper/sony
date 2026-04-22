"use client";

interface CopyPitchButtonProps {
  pitch: string;
}

export default function CopyPitchButton({ pitch }: CopyPitchButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(pitch);
    alert("Sales pitch copied to clipboard!");
  };

  return (
    <button
      className="px-8 py-4 bg-accent hover:bg-accent-hover text-background font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
      onClick={handleCopy}
    >
      Copy Sales Pitch
    </button>
  );
}
