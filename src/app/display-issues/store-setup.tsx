"use client";

import { useState } from "react";
import { addStore, updateStoreInfo, removeStore } from "@/lib/store-storage";
import type { StoreInfo } from "@/lib/store-storage";
import AddressAutocomplete from "./address-autocomplete";
import styles from "./display-issues.module.scss";

interface StoreFormProps {
  /** If provided, form is in edit mode with pre-filled data */
  existing?: StoreInfo;
  /** Called after a store is created or updated */
  onSave: (info: StoreInfo) => void;
  /** Called to dismiss the form without saving */
  onCancel: () => void;
  /** Called after a store is deleted (edit mode only) */
  onDelete?: () => void;
  /** IDs of stores that already exist (for duplicate check in create mode) */
  existingIds?: string[];
}

export default function StoreForm({
  existing,
  onSave,
  onCancel,
  onDelete,
  existingIds = [],
}: StoreFormProps) {
  const isEdit = !!existing;

  const [storeNumber, setStoreNumber] = useState(existing?.id || "");
  const [nickname, setNickname] = useState(existing?.nickname || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [lat, setLat] = useState<number | undefined>(existing?.lat);
  const [lng, setLng] = useState<number | undefined>(existing?.lng);
  const [error, setError] = useState("");

  const handleAddressChange = (
    addr: string,
    newLat?: number,
    newLng?: number
  ) => {
    setAddress(addr);
    if (newLat != null && newLng != null) {
      setLat(newLat);
      setLng(newLng);
    }
  };

  const handleSubmit = () => {
    const trimmedId = storeNumber.trim();

    if (!/^\d{4}$/.test(trimmedId)) {
      setError("Enter exactly 4 digits (e.g., 0058)");
      return;
    }

    if (!isEdit && existingIds.includes(trimmedId)) {
      setError("Store already exists");
      return;
    }

    const info: StoreInfo = {
      id: trimmedId,
      nickname: nickname.trim() || undefined,
      address: address.trim() || undefined,
      lat,
      lng,
    };

    if (isEdit) {
      updateStoreInfo(info);
    } else {
      addStore(info);
    }

    onSave(info);
  };

  const handleDelete = () => {
    if (!existing) return;
    if (!confirm(`Delete store BBUY${existing.id} and all its issue data?`)) return;
    removeStore(existing.id);
    onDelete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.storeFormPanel}>
      <h2 className={styles.storeFormTitle}>
        {isEdit ? "Edit Store Info" : "Add a Store"}
      </h2>

      {/* Store Number */}
      <div className={styles.formField}>
        <label className={styles.formLabel}>Store Number *</label>
        <div className={styles.storeInputGroup}>
          <span className={styles.storePrefix}>BBUY</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={storeNumber}
            onChange={(e) => {
              setStoreNumber(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="0058"
            className={styles.storeInput}
            disabled={isEdit}
            autoFocus={!isEdit}
          />
        </div>
      </div>

      {/* Nickname */}
      <div className={styles.formField}>
        <label className={styles.formLabel}>
          Store Nickname
          <span className={styles.formOptional}>optional</span>
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Willowbrook"
          className={styles.formInput}
          autoFocus={isEdit}
        />
      </div>

      {/* Address */}
      <div className={styles.formField}>
        <label className={styles.formLabel}>
          Store Address
          <span className={styles.formOptional}>optional</span>
        </label>
        <AddressAutocomplete
          value={address}
          onChange={handleAddressChange}
          placeholder="e.g. 7500 S Cass Ave, Darien, IL"
        />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {/* Actions */}
      <div className={styles.storeFormActions}>
        <button
          type="button"
          onClick={handleSubmit}
          className={styles.btnPrimary}
        >
          {isEdit ? "Save Changes" : "Add Store"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={styles.btnSecondary}
        >
          Cancel
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className={styles.btnDanger}
          >
            Delete Store
          </button>
        )}
      </div>
    </div>
  );
}
