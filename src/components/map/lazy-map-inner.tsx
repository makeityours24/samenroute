"use client";

import { Map } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export function LazyMapInner({
  title,
  items,
  browserKeyAvailable,
  copy
}: {
  title: string;
  items: Array<{ id: string; name: string }>;
  browserKeyAvailable: boolean;
  copy?: {
    unavailableTitle: string;
    unavailableBody: string;
    loaded: string;
    selectedPlaces: string;
  };
}) {
  const labels = copy ?? {
    unavailableTitle: "Map unavailable",
    unavailableBody: "Map rendering is optional. Add a restricted browser key to enable contextual maps.",
    loaded: "Provider map boundary loaded lazily.",
    selectedPlaces: "selected places ready for contextual rendering."
  };

  if (!browserKeyAvailable) {
    return <EmptyState title={labels.unavailableTitle} description={labels.unavailableBody} />;
  }

  return (
    <Card id="map" className="space-y-3">
      <div className="flex items-center gap-2">
        <Map className="h-4 w-4 text-[var(--accent)]" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="rounded-[24px] bg-[var(--surface-subtle)] p-5 text-sm text-[var(--muted-foreground)]">
        {labels.loaded}
        <br />
        {items.length} {labels.selectedPlaces}
      </div>
    </Card>
  );
}
