import { Metadata } from "next";
import SpecLookupClient from "./spec-lookup-client";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Spec Filter | Sony Rep Toolkit",
  description: "Advanced camera specification lookup and filtering tool.",
};

export default function SpecLookupPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <SpecLookupClient />
      </main>
    </>
  );
}
