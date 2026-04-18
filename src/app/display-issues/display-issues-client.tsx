"use client";

import { useState, useEffect } from "react";
import StoreSetup from "./store-setup";
import DisplayIssuesForm from "./display-issues-form";
import {
  getStores,
  getActiveStore,
  setActiveStore,
} from "@/lib/store-storage";

/**
 * Top-level client component that switches between
 * store setup and the issues form based on localStorage state.
 */
export default function DisplayIssuesClient() {
  const [mounted, setMounted] = useState(false);
  const [activeStore, setActive] = useState<string | null>(null);
  const [stores, setStores] = useState<string[]>([]);

  // Hydration guard — read localStorage only after mount
  useEffect(() => {
    setStores(getStores());
    setActive(getActiveStore());
    setMounted(true);
  }, []);

  const handleStoreSelected = (storeId: string) => {
    setActiveStore(storeId);
    setActive(storeId);
    setStores(getStores());
  };

  const handleChangeStore = () => {
    setActive(null);
  };

  const handleStoresChanged = () => {
    setStores(getStores());
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // If no active store selected, show store setup/selector
  if (!activeStore || !stores.includes(activeStore)) {
    return (
      <StoreSetup
        stores={stores}
        onStoreSelected={handleStoreSelected}
        onStoresChanged={handleStoresChanged}
      />
    );
  }

  // Active store selected — show the issues form
  return (
    <DisplayIssuesForm
      storeId={activeStore}
      onChangeStore={handleChangeStore}
    />
  );
}
