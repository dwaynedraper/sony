import type { Metadata } from "next";
import BackButton from "@/components/back-button";
import TableSurvey from "@/app/components/table-survey/table-survey";

export const metadata: Metadata = {
  title: "Display Issues | Sony Rep Toolkit",
  description: "Walk the table and flag broken, alarmed, missing, or dead display units per store.",
};

export default function DisplayIssuesPage() {
  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <BackButton />
      <TableSurvey mode="issues" />
    </main>
  );
}
