"use client";

import dynamic from "next/dynamic";

const LazyMapInner = dynamic(() => import("./lazy-map-inner").then((module) => module.LazyMapInner), {
  ssr: false
});

export function LazyMap(props: {
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
  return <LazyMapInner {...props} />;
}
