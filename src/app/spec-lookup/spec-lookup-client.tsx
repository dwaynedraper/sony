"use client";

import { useState, useMemo } from "react";
import { cameraSpecs, COLUMNS, CameraSpec } from "./data/specs";
import { SpecTable } from "./spec-table";
import styles from "./spec-lookup.module.scss";

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

const normalizeName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // Remove spaces, dashes, etc.
    .replace(/iii/g, "3")
    .replace(/ii/g, "2")
    .replace(/iv/g, "4")
    .replace(/v/g, "5");
};

export default function SpecLookupClient() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortHistory, setSortHistory] = useState<SortConfig[]>([{ key: "mp", direction: "desc" }]);

  const handleFilterChange = (key: string, value: string, isNumeric?: boolean) => {
    let finalValue = value;
    if (isNumeric) {
      finalValue = value.replace(/[^0-9]/g, "");
    }
    setFilters((prev) => ({ ...prev, [key]: finalValue }));
  };

  const handleSort = (key: string) => {
    setSortHistory((prev) => {
      const existingIdx = prev.findIndex((s) => s.key === key);
      const newHistory = [...prev];

      if (existingIdx === 0) {
        // Toggle direction if clicking the primary sort
        newHistory[0] = {
          key,
          direction: prev[0].direction === "desc" ? "asc" : "desc",
        };
      } else {
        // Move to front and default to desc (except for name)
        const direction = key === "name" ? "asc" : "desc";
        if (existingIdx !== -1) {
          newHistory.splice(existingIdx, 1);
        }
        newHistory.unshift({ key, direction });
      }

      return newHistory.slice(0, 3); // Keep last 3
    });
  };

  const processedData = useMemo(() => {
    const scored = cameraSpecs.map((camera) => {
      let matchCount = 0;
      let activeFilterCount = 0;
      const failedKeys = new Set<string>();

      // Check name (Soft logic / Aliases)
      if (filters["name"]) {
        activeFilterCount++;
        const search = normalizeName(filters["name"]);
        const target = normalizeName(camera.name);
        if (target.includes(search)) matchCount++;
        else failedKeys.add("name");
      }

      // Check video (Special grouping)
      const vRes = filters["videoResK"] ? parseInt(filters["videoResK"]) : null;
      const vFps = filters["videoFps"] ? parseInt(filters["videoFps"]) : null;
      if (vRes || vFps) {
        activeFilterCount++;
        let match = true;
        
        // Logical check: only filter out if the resolution match doesn't meet FPS
        if (vRes === 8) {
          if ((camera.video8kFps ?? 0) < (vFps ?? 0)) match = false;
        } else {
          // Assume user means "At least 4K" if they enter 4 (or anything else)
          if ((camera.video4kFps ?? 0) < (vFps ?? 0)) match = false;
          // If they specifically want 4K but have an 8K box, we check their 4K capability
        }
        
        if (match) matchCount++;
        else failedKeys.add("video");
      }

      // Check other columns
      for (const col of COLUMNS) {
        if (col.key === "video") continue; // Handled above
        const filterValue = filters[col.key as string];
        if (!filterValue) continue;

        activeFilterCount++;
        const cameraValue = camera[col.key];
        let isMatch = true;

        if (col.type === "number") {
          const min = parseFloat(filterValue);
          if (!isNaN(min)) isMatch = (cameraValue ?? 0) >= min;
        } else if (col.type === "boolean") {
          const search = filterValue.toLowerCase();
          if (search.startsWith("y")) isMatch = cameraValue === true;
          else if (search.startsWith("n")) isMatch = cameraValue === false;
        } else {
          // String match (with normalization for things like sensorSize 'apsc' vs 'APS-C')
          const search = filterValue.toLowerCase().replace(/[^a-z0-9]/g, "");
          const target = cameraValue?.toString().toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
          isMatch = target.includes(search);
        }

        if (isMatch) matchCount++;
        else failedKeys.add(col.key as string);
      }

      return {
        camera,
        matchCount,
        failedKeys,
      };
    });

    // 2. Advanced Multi-tier Sort
    scored.sort((a, b) => {
      // ABSOLUTE PRIMARY: Match Quality (Red cell count)
      // We want FEWER failed keys at the top
      if (a.failedKeys.size !== b.failedKeys.size) {
        return a.failedKeys.size - b.failedKeys.size;
      }

      // TIE BREAKERS: Sort History (Last 3 clicks)
      for (const sort of sortHistory) {
        const key = sort.key;
        let valA: any, valB: any;

        if (key === "video") {
          valA = a.camera.video4kFps ?? 0;
          valB = b.camera.video4kFps ?? 0;
        } else {
          valA = a.camera[key] ?? 0;
          valB = b.camera[key] ?? 0;
        }

        if (valA !== valB) {
          if (typeof valA === "string") {
            return sort.direction === "asc" 
              ? valA.localeCompare(valB) 
              : valB.localeCompare(valA);
          }
          return sort.direction === "desc" ? valB - valA : valA - valB;
        }
      }
      return a.camera.name.localeCompare(b.camera.name);
    });

    return {
      sortedCameras: scored.map((s) => s.camera),
      failedCells: scored.reduce((acc, s) => {
        acc[s.camera.sku] = s.failedKeys;
        return acc;
      }, {} as Record<string, Set<string>>),
    };
  }, [filters, sortHistory]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Spec Filter</h1>
        <p className={styles.description}>
          A tool for quickly finding cameras by exact spec instead of use case.
        </p>
      </header>

      <div className={styles.resultsCount}>
        Showing {cameraSpecs.length} cameras. Matching items are sorted to the top.
      </div>

      <SpecTable
        cameras={processedData.sortedCameras}
        filters={filters}
        onFilterChange={handleFilterChange}
        failedCells={processedData.failedCells}
        sortHistory={sortHistory}
        onSort={handleSort}
      />
    </div>
  );
}
