"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./display-issues.module.scss";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

function formatAddress(props: PhotonFeature["properties"]): string {
  const parts: string[] = [];

  // Street address
  if (props.housenumber && props.street) {
    parts.push(`${props.housenumber} ${props.street}`);
  } else if (props.street) {
    parts.push(props.street);
  } else if (props.name) {
    parts.push(props.name);
  }

  // City, State ZIP
  const cityState: string[] = [];
  if (props.city) cityState.push(props.city);
  if (props.state) cityState.push(props.state);
  if (cityState.length > 0) {
    let line = cityState.join(", ");
    if (props.postcode) line += ` ${props.postcode}`;
    parts.push(line);
  }

  return parts.join(", ");
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing an address…",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<
    { label: string; lat: number; lng: number }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    try {
      const url = `https://photon.komoot.io/api?q=${encodeURIComponent(
        query
      )}&limit=5&lang=en`;
      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      const features: PhotonFeature[] = data.features || [];

      const results = features.map((f) => ({
        label: formatAddress(f.properties),
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
      }));

      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch {
      // Photon unavailable — graceful fallback, dropdown stays closed
      setSuggestions([]);
      setIsOpen(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val); // Update parent with raw text (no lat/lng yet)

    // Debounced fetch
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (suggestion: {
    label: string;
    lat: number;
    lng: number;
  }) => {
    setInputValue(suggestion.label);
    onChange(suggestion.label, suggestion.lat, suggestion.lng);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className={styles.autocompleteWrapper}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={styles.formInput}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className={styles.autocompleteDropdown}>
          {suggestions.map((s, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className={styles.autocompleteOption}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
