import type { Metadata } from "next";
import BackButton from "@/components/back-button";
import TableSurvey from "@/app/components/table-survey/table-survey";

export const metadata: Metadata = {
  title: "Out of Stock | Sony Rep Toolkit",
  description: "Walk the table and mark out-of-stock items for your daily survey.",
};

export default function OosPage() {
  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
      <BackButton />
      <TableSurvey mode="stock" />
    </main>
  );
}
