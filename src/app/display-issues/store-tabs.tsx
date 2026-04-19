"use client";

import type { StoreInfo } from "@/lib/store-storage";
import { getStoreLabel } from "@/lib/store-storage";
import styles from "./display-issues.module.scss";

interface StoreTabsProps {
  stores: StoreInfo[];
  activeStoreId: string | null;
  onSelectStore: (id: string) => void;
  onAddStore: () => void;
}

export default function StoreTabs({
  stores,
  activeStoreId,
  onSelectStore,
  onAddStore,
}: StoreTabsProps) {
  return (
    <div className={styles.tabBar} role="tablist" aria-label="Store tabs">
      <div className={styles.tabScroll}>
        {stores.map((store) => {
          const isActive = store.id === activeStoreId;
          return (
            <button
              key={store.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectStore(store.id)}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            >
              {getStoreLabel(store)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onAddStore}
          className={styles.tabAdd}
          aria-label="Add a store"
        >
          +
        </button>
      </div>
    </div>
  );
}
