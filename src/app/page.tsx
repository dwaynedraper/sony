import Navbar from "@/components/navbar";
import ToolCard from "@/components/tool-card";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Tools
          </h1>
          <p className="mt-2 text-text-secondary">
            Select a tool to get started with your daily tasks.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            title="Out of Stock"
            description="Walk the display, check what's missing, and generate an OOS list ready to paste."
            href="/oos"
            icon="📋"
          />

          {/* Future tools — cards will be added here */}
        </div>
      </main>
    </>
  );
}
