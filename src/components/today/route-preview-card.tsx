import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function RoutePreviewCard({
  title,
  stops,
  mapsUrl,
  copy
}: {
  title: string;
  stops: string[];
  mapsUrl?: string | null;
  copy?: { badge: string; stops: string; openMaps: string };
}) {
  const labels = copy ?? { badge: "Route preview", stops: "stops", openMaps: "Open in Google Maps" };

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Badge tone="accent">{labels.badge}</Badge>
          <h2 className="mt-2 text-lg font-semibold">{title}</h2>
        </div>
        <Badge>{stops.length} {labels.stops}</Badge>
      </div>
      <ol className="space-y-2 text-sm">
        {stops.map((stop, index) => (
          <li key={`${stop}-${index}`} className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 shadow-[var(--shadow-soft)]">
            {index + 1}. {stop}
          </li>
        ))}
      </ol>
      {mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
        >
          <ExternalLink className="h-4 w-4" />
          {labels.openMaps}
        </a>
      ) : null}
    </Card>
  );
}
