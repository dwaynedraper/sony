import { Metadata } from "next";
import BasketBuilderClient from "./basket-builder-client";
import BackButton from "@/components/back-button";

export const metadata: Metadata = {
  title: "Basket Builder | Sony Rep Toolkit",
  description: "Create a customized equipment basket for any photography genre.",
};

export default function BasketBuilderPage() {
  return (
    <main className="flex-1 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <BackButton />
        <BasketBuilderClient />
      </div>
    </main>
  );
}
