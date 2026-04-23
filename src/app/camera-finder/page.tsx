import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import BackButton from "@/components/back-button";
import CameraFinderClient from "./client";

export const metadata: Metadata = {
  title: "Camera Finder | Sony Rep Toolkit",
  description: "A quick recommendation tool to help customers find their perfect Sony camera match.",
};

export default function CameraFinderPage() {
  return (
    <>
      <main className="flex-1 w-full bg-base px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <BackButton />
        </div>
        <CameraFinderClient />
      </main>
    </>
  );
}
