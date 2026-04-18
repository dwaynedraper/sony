import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import DisplayIssuesClient from "./display-issues-client";

export const metadata: Metadata = {
  title: "Display Issues | Sony Rep Toolkit",
  description: "Track and report camera display functionality issues per store.",
};

export default function DisplayIssuesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <DisplayIssuesClient />
      </main>
    </>
  );
}
