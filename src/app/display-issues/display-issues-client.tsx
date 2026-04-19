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

  // ── Mount: load stores, attempt geolocation ─────────────────────────────
  useEffect(() => {
    const storeList = getStoreList();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStores(storeList);

    const saved = getActiveStore();
    const locateParam = searchParams.get("locate");

    // If we have stores with lat/lng and user hasn't denied geo, try auto-select
    const storesWithGeo = storeList.filter(
      (s) => s.lat != null && s.lng != null
    );

    if (locateParam === "true" && storesWithGeo.length > 0 && !isGeoDenied() && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nearest = findNearestStore(
            pos.coords.latitude,
            pos.coords.longitude,
            storesWithGeo
          );
          if (nearest) {
            setActiveStore(nearest.id);
            setActiveId(nearest.id);
          } else if (saved && storeList.some((s) => s.id === saved)) {
            setActiveId(saved);
          } else if (storeList.length > 0) {
            setActiveStore(storeList[0].id);
            setActiveId(storeList[0].id);
          }
          if (locateParam) router.replace(pathname);
          setMounted(true);
        },
        () => {
          // Denied or error — remember preference, fall back
          setGeoDenied(true);
          if (saved && storeList.some((s) => s.id === saved)) {
            setActiveId(saved);
          } else if (storeList.length > 0) {
            setActiveStore(storeList[0].id);
            setActiveId(storeList[0].id);
          }
          if (locateParam) router.replace(pathname);
          setMounted(true);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else {
      // No geo-eligible stores or geo denied — fall back
      if (saved && storeList.some((s) => s.id === saved)) {
        setActiveId(saved);
      } else if (storeList.length > 0) {
        setActiveStore(storeList[0].id);
        setActiveId(storeList[0].id);
      }
      if (locateParam) router.replace(pathname);
      setMounted(true);
    }
  }, [searchParams, pathname, router]);

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
