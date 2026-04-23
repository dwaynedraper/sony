"use client";

import { useState, useEffect } from "react";
import { getMigrationData, syncFromCloud } from "@/lib/store-storage";

export default function AuthMigration() {
  const [show, setShow] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    // Only show if we have stores in localStorage but haven't migrated yet
    const data = getMigrationData();
    const hasData = data.stores.length > 0;
    const alreadyMigrated = localStorage.getItem("sony-toolkit-migrated") === "true";

    if (hasData && !alreadyMigrated) {
      setShow(true);
    }
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const data = getMigrationData();
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        localStorage.setItem("sony-toolkit-migrated", "true");
        // Pull down fresh state to ensure everything is in sync
        await syncFromCloud();
        setShow(false);
        window.location.reload(); // Refresh to update all components
      }
    } catch (err) {
      console.error("Migration failed:", err);
    } finally {
      setMigrating(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-2xl backdrop-blur-xl">
        <h3 className="font-bold text-foreground">Cloud Sync Available</h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          We found store data on this device. Would you like to sync it to your account so you can access it from anywhere?
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {migrating ? "Syncing..." : "Sync to Cloud"}
          </button>
          <button
            onClick={() => {
              localStorage.setItem("sony-toolkit-migrated", "true");
              setShow(false);
            }}
            disabled={migrating}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-hover transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
