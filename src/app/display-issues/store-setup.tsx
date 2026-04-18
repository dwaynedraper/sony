"use client";

import { useState } from "react";
import { addStore, removeStore } from "@/lib/store-storage";
import styles from "./display-issues.module.scss";

interface StoreSetupProps {
  stores: string[];
  onStoreSelected: (storeId: string) => void;
  onStoresChanged: () => void;
}

export default function StoreSetup({
  stores,
  onStoreSelected,
  onStoresChanged,
}: StoreSetupProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();

    if (!/^\d{4}$/.test(trimmed)) {
      setError("Enter exactly 4 digits (e.g., 0058)");
      return;
    }

    if (stores.includes(trimmed)) {
      setError("Store already added");
      return;
    }

    addStore(trimmed);
    setInput("");
    setError("");
    onStoresChanged();
    onStoreSelected(trimmed);
  };

  const handleRemove = (id: string) => {
    removeStore(id);
    onStoresChanged();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={styles.setupWrapper}>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">
        Display Issues
      </h1>
      <p className="mt-1 text-sm text-text-secondary mb-6">
        {stores.length === 0
          ? "Add your store to get started."
          : "Select a store or add a new one."}
      </p>

      {/* Existing stores */}
      {stores.length > 0 && (
        <div className={styles.storeList}>
          <h2 className={styles.storeListTitle}>Your Stores</h2>
          <div className={styles.storeChips}>
            {stores.map((id) => (
              <div key={id} className={styles.storeChip}>
                <button
                  type="button"
                  onClick={() => onStoreSelected(id)}
                  className={styles.storeChipSelect}
                >
                  BBUY{id}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className={styles.storeChipRemove}
                  aria-label={`Remove store BBUY${id}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add store input */}
      <div className={styles.addStoreRow}>
        <div className={styles.storeInputGroup}>
          <span className={styles.storePrefix}>BBUY</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={input}
            onChange={(e) => {
              setInput(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="0058"
            className={styles.storeInput}
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className={styles.btnPrimary}
        >
          Add Store
        </button>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
