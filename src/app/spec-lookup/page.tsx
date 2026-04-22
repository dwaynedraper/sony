import { Metadata } from "next";
import SpecLookupClient from "./spec-lookup-client";
import Navbar from "@/components/navbar";
import BackButton from "@/components/back-button";

export const metadata: Metadata = {
  title: "Spec Filter | Sony Rep Toolkit",
  description: "Advanced camera specification lookup and filtering tool.",
};

export default function SpecLookupPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <BackButton />
        </div>
        <SpecLookupClient />
      </main>
    </>
  );
}
