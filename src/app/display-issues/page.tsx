import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import BackButton from "@/components/back-button";
import DisplayIssuesClient from "./display-issues-client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Display Issues | Sony Rep Toolkit",
  description: "Track and report camera display functionality issues per store.",
};

export default function DisplayIssuesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <BackButton />
        <Suspense fallback={null}>
          <DisplayIssuesClient />
        </Suspense>
      </main>
    </>
  );
}
