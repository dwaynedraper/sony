import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import OosForm from "./oos-form";

export const metadata: Metadata = {
  title: "Out of Stock | Sony Rep Toolkit",
  description: "Generate an out-of-stock list for your daily survey.",
};

export default function OosPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <OosForm />
      </main>
    </>
  );
}
