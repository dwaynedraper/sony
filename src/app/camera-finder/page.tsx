import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import CameraFinderClient from "./client";

export const metadata: Metadata = {
  title: "Camera Finder | Sony Rep Toolkit",
  description: "A quick recommendation tool to help customers find their perfect Sony camera match.",
};

export default function CameraFinderPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-base">
        <CameraFinderClient />
      </main>
    </>
  );
}
