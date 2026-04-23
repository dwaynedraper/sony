"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import StoreTabs from "./store-tabs";
import StoreForm from "./store-setup";
import DisplayIssuesForm from "./display-issues-form";
import {
  getStoreList,
  getActiveStore,
  setActiveStore,
  isGeoDenied,
  setGeoDenied,
  findNearestStore,
} from "@/lib/store-storage";
import type { StoreInfo } from "@/lib/store-storage";

type View = "form" | "add" | "edit";

/**
 * Top-level client component — tab-based store switcher
 * with geolocation auto-select and inline store creation/editing.
 */
export default function DisplayIssuesClient() {
  const [mounted, setMounted] = useState(false);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<View>("form");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Refresh store list from localStorage
  const refreshStores = useCallback(() => {
    setStores(getStoreList());
  }, []);

  // ── Mount: load stores from cloud ────────────────────────────────────────
  useEffect(() => {
    let active = true;
    
    async function load() {
      const { syncFromCloud } = await import("@/lib/store-storage");
      await syncFromCloud();
      if (!active) return;

      const list = getStoreList();
      setStores(list);
      
      const saved = getActiveStore();
      if (saved && list.some(s => s.id === saved)) {
        setActiveId(saved);
      } else if (list.length > 0) {
        setActiveId(list[0].id);
      }
      setMounted(true);
    }

    load();
    return () => { active = false; };
  }, []);

  // ── Geolocation: only if ?locate=true ────────────────────────────────────
  useEffect(() => {
    if (!mounted || searchParams.get("locate") !== "true") return;

    if (navigator.geolocation && !isGeoDenied()) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nearest = findNearestStore(pos.coords.latitude, pos.coords.longitude, stores);
          if (nearest) {
            handleSelectStore(nearest.id);
          }
          router.replace(pathname);
        },
        () => {
          setGeoDenied(true);
          router.replace(pathname);
        }
      );
    } else {
      router.replace(pathname);
    }
  }, [mounted, searchParams, pathname, router, stores]);



  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSelectStore = (id: string) => {
    setActiveStore(id);
    setActiveId(id);
    setView("form");
  };

  const handleAddClick = () => {
    setView("add");
  };

  const handleStoreSaved = (info: StoreInfo) => {
    refreshStores();
    setActiveStore(info.id);
    setActiveId(info.id);
    setView("form");
  };

  const handleEditClick = () => {
    setView("edit");
  };

  const handleStoreDeleted = () => {
    refreshStores();
    const remaining = getStoreList();
    if (remaining.length > 0) {
      setActiveStore(remaining[0].id);
      setActiveId(remaining[0].id);
    } else {
      setActiveId(null);
    }
    setView("form");
  };

  const handleCancel = () => {
    setView("form");
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (!mounted) return null;

  // No stores at all — show just the add form
  if (stores.length === 0 && view !== "add") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: "2rem" }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Display Issues
        </h1>
        <p className="mt-1 text-sm text-text-secondary mb-6">
          Add your first store to get started.
        </p>
        <StoreForm
          onSave={handleStoreSaved}
          onCancel={() => {}}
          existingIds={[]}
        />
      </div>
    );
  }

  const activeStore = stores.find((s) => s.id === activeId);
  const existingIds = stores.map((s) => s.id);

  return (
    <>
      {/* Tab Bar */}
      <StoreTabs
        stores={stores}
        activeStoreId={activeId}
        onSelectStore={handleSelectStore}
        onAddStore={handleAddClick}
      />

      {/* Content area */}
      {view === "add" && (
        <StoreForm
          onSave={handleStoreSaved}
          onCancel={handleCancel}
          existingIds={existingIds}
        />
      )}

      {view === "edit" && activeStore && (
        <StoreForm
          existing={activeStore}
          onSave={() => {
            refreshStores();
            setView("form");
          }}
          onCancel={handleCancel}
          onDelete={handleStoreDeleted}
          existingIds={existingIds}
        />
      )}

      {view === "form" && activeId && (
        <DisplayIssuesForm
          key={activeId}
          storeId={activeId}
          storeInfo={activeStore}
          onEditStore={handleEditClick}
        />
      )}

      {view === "form" && !activeId && stores.length > 0 && (
        <p className="text-center text-text-secondary mt-8">
          Select a store tab above.
        </p>
      )}
    </>
  );
}
