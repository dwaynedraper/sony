"use client";

import React from "react";
import { CameraSpec, COLUMNS, SpecColumn } from "./data/specs";
import styles from "./spec-lookup.module.scss";
import { SortConfig } from "./spec-lookup-client";

interface SpecTableProps {
  cameras: CameraSpec[];
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string, isNumeric?: boolean) => void;
  failedCells: Record<string, Set<string>>; // cameraSku -> Set of keys that failed
  sortHistory: SortConfig[];
  onSort: (key: string) => void;
}

export function SpecTable({ 
  cameras, 
  filters, 
  onFilterChange, 
  failedCells,
  sortHistory,
  onSort
}: SpecTableProps) {
  
  const getSortIcon = (key: string) => {
    const config = sortHistory.find(s => s.key === key);
    const isPrimary = sortHistory[0]?.key === key;
    
    if (!config) return <span className={styles.sortIcon}>↕</span>;
    return (
      <span className={`${styles.sortIcon} ${isPrimary ? styles.active : ""}`}>
        {config.direction === "desc" ? "↓" : "↑"}
      </span>
    );
  };

  const renderCell = (camera: CameraSpec, col: SpecColumn) => {
    const value = camera[col.key];
    const isFailed = failedCells[camera.sku]?.has(col.key as string);
    const cellClass = `${styles.td} ${isFailed ? styles.failed : ""}`;

    if (col.type === "video") {
      const v8 = camera.video8kFps;
      const v4 = camera.video4kFps;
      return (
        <td className={cellClass}>
          {v8 ? `8K ${v8}p | ` : ""}4K {v4}p
        </td>
      );
    }

    if (col.type === "boolean") {
      return (
        <td className={cellClass}>
          <span className={`${styles.badge} ${value ? styles.yes : styles.no}`}>
            {value ? "YES" : "NO"}
          </span>
        </td>
      );
    }

    return (
      <td className={cellClass}>
        {value === 0 && col.key === "ibisStops" ? "None" : value ?? "—"}
      </td>
    );
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.headerRow}>
            <th 
              className={`${styles.th} ${styles.stickyCol} ${styles.stickyCorner} ${sortHistory[0]?.key === "name" ? styles.active : ""}`}
              onClick={() => onSort("name")}
            >
              Camera Name
              {getSortIcon("name")}
            </th>
            {COLUMNS.map((col) => (
              <th 
                key={col.key as string} 
                className={`${styles.th} ${sortHistory[0]?.key === col.key ? styles.active : ""}`}
                onClick={() => onSort(col.key as string)}
              >
                {col.label}
                {getSortIcon(col.key as string)}
              </th>
            ))}
          </tr>
          <tr className={`${styles.headerRow} ${styles.filterRow}`}>
            <th className={`${styles.th} ${styles.stickyCol}`}>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Search name..."
                value={filters["name"] || ""}
                onChange={(e) => onFilterChange("name", e.target.value)}
              />
            </th>
            {COLUMNS.map((col) => (
              <th key={col.key as string} className={styles.th}>
                {col.type === "video" ? (
                  <div className={styles.videoFilterWrapper}>
                    <input
                      type="text"
                      className={`${styles.filterInput} ${styles.videoInput}`}
                      placeholder="8/4"
                      value={filters["videoResK"] || ""}
                      onChange={(e) => onFilterChange("videoResK", e.target.value, true)}
                    />
                    <span>K</span>
                    <input
                      type="text"
                      className={`${styles.filterInput} ${styles.videoInput}`}
                      placeholder="60"
                      value={filters["videoFps"] || ""}
                      onChange={(e) => onFilterChange("videoFps", e.target.value, true)}
                    />
                    <span>p</span>
                  </div>
                ) : col.key === "sensorSize" ? (
                  <select
                    className={styles.filterInput}
                    value={filters[col.key as string] || ""}
                    onChange={(e) => onFilterChange(col.key as string, e.target.value)}
                  >
                    <option value="">All Sensors</option>
                    <option value="1-inch">1-inch</option>
                    <option value="mft">MFT</option>
                    <option value="apsc">APS-C</option>
                    <option value="full frame">Full Frame</option>
                  </select>
                ) : col.key === "weatherSealed" ? (
                  <select
                    className={styles.filterInput}
                    value={filters[col.key as string] || ""}
                    onChange={(e) => onFilterChange(col.key as string, e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className={styles.filterInput}
                    placeholder={col.type === "number" ? "Min..." : "Filter..."}
                    value={filters[col.key as string] || ""}
                    onChange={(e) => onFilterChange(col.key as string, e.target.value, col.type === "number")}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cameras.map((cam) => {
            const isNameActive = sortHistory[0]?.key === "name";
            const isNameFailed = failedCells[cam.sku]?.has("name");
            const nameCellClass = `${styles.td} ${styles.stickyCol} ${styles.nameCell} ${isNameActive ? styles.activeName : ""} ${isNameFailed ? styles.failed : ""}`;
            
            return (
              <tr key={cam.sku} className={styles.trSelection}>
                <td className={nameCellClass}>
                  {cam.name}
                  <span className={styles.sku}>{cam.sku}</span>
                </td>
                {COLUMNS.map((col) => (
                  <React.Fragment key={col.key as string}>
                    {renderCell(cam, col)}
                  </React.Fragment>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
