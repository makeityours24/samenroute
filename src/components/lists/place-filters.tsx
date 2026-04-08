"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";

export function PlaceFilters({
  value,
  onChange,
  labels
}: {
  value: string;
  onChange: (value: string) => void;
  labels?: { all: string; planned: string; visited: string; skipped: string; favorites: string };
}) {
  const copy = labels ?? {
    all: "All",
    planned: "Planned",
    visited: "Visited",
    skipped: "Skipped",
    favorites: "Favorites"
  };

  return (
    <SegmentedControl
      value={value}
      onChange={onChange}
      items={[
        { label: copy.all, value: "all" },
        { label: copy.planned, value: "planned" },
        { label: copy.visited, value: "visited" },
        { label: copy.skipped, value: "skipped" },
        { label: copy.favorites, value: "favorites" }
      ]}
    />
  );
}
