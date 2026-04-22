import Navbar from "@/components/navbar";
import ToolCard from "@/components/tool-card";
import CageFightCard from "@/components/cage-fight-card";
import { cageFights } from "@/data/cage-fights";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6 mt-10">
      <h2 className="text-sm font-black uppercase tracking-[0.3em] text-accent whitespace-nowrap">
        {title}
      </h2>
      <div className="h-1 flex-1 bg-gradient-to-r from-accent to-transparent rounded-full opacity-30" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            Sony Sales Hub
          </h1>
          <p className="mt-2 text-text-secondary font-medium">
            Professional tools for the showroom floor.
          </p>
        </div>

        {/* Internal Tools */}
        <section>
          <SectionHeader title="Internal Tools" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard
              title="Out of Stock"
              description="Walk the display, check what's missing, and generate an OOS list ready to paste."
              href="/oos"
              icon="📋"
            />
            <ToolCard
              title="Display Issues"
              description="Track alarm, power, and other display problems per store. Data persists between visits."
              href="/display-issues?locate=true"
              icon="⚠️"
            />
          </div>
        </section>

        {/* Customer Interaction Tools */}
        <section className="">
          <SectionHeader title="Customer Interaction Tools" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard
              title="Camera Finder"
              description="A quick recommendation tool to help customers find their perfect Sony camera match."
              href="/camera-finder"
              icon="📷"
            />
            <ToolCard
              title="Spec Filter"
              description="A tool for quickly finding cameras by exact spec instead of use case."
              href="/spec-lookup"
              icon="📊"
            />
          </div>
        </section>

        {/* Cage Fights Section */}
        <section className="mb-16">
          <SectionHeader title="Cage Fights" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cageFights.map((fight) => (
              <CageFightCard key={fight.slug} fight={fight} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
