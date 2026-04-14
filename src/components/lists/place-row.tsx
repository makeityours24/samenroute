import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PlaceStatusBadge } from "@/components/places/place-status-badge";
import { PlaceActionsMenu } from "@/components/places/place-actions-menu";

export function PlaceRow({
  name,
  location,
  category,
  note,
  status,
  priority,
  isFavorite,
  includeInRoute,
  smartSignals,
  preferenceSection,
  primaryActions,
  secondaryActions,
  copy
}: {
  name: string;
  location: string;
  category?: string | null;
  note?: string | null;
  status: "PLANNED" | "VISITED" | "SKIPPED";
  priority: number;
  isFavorite: boolean;
  includeInRoute: boolean;
  smartSignals?: string[];
  preferenceSection?: ReactNode;
  primaryActions?: ReactNode;
  secondaryActions?: ReactNode;
  copy?: {
    inRoute: string;
    excluded: string;
    priorityLabel: string;
    openActions: string;
    smartSignalsLabel: string;
    status: { planned: string; visited: string; skipped: string };
  };
}) {
  const labels = copy ?? {
    inRoute: "In route",
    excluded: "Excluded",
    priorityLabel: "Priority",
    openActions: "Open actions",
    smartSignalsLabel: "Smart signals",
    status: { planned: "Planned", visited: "Visited", skipped: "Skipped" }
  };

  return (
    <Card className="min-w-0 max-w-full space-y-3 overflow-hidden p-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[15px] font-semibold">{name}</p>
            {isFavorite ? <Star className="h-4 w-4 fill-current text-[var(--warning)]" /> : null}
          </div>
          <p className="truncate text-sm text-[var(--muted-foreground)]">{location}</p>
          <div className="mt-2 flex min-w-0 flex-wrap gap-2">
            <PlaceStatusBadge status={status} labels={labels.status} />
            {category ? <Badge>{category}</Badge> : null}
            <Badge>{includeInRoute ? labels.inRoute : labels.excluded}</Badge>
            <Badge>{labels.priorityLabel} {priority}</Badge>
          </div>
        </div>
        {secondaryActions ? <PlaceActionsMenu title={name} actionLabel={`${labels.openActions}: ${name}`}>{secondaryActions}</PlaceActionsMenu> : null}
      </div>
      {note ? <p className="line-clamp-2 rounded-2xl bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--muted-foreground)]">{note}</p> : null}
      {smartSignals && smartSignals.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{labels.smartSignalsLabel}</p>
          <div className="flex flex-wrap gap-2">
            {smartSignals.map((signal) => (
              <Badge key={signal} tone="accent">
                {signal}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      {preferenceSection ? preferenceSection : null}
      {primaryActions ? <div className="grid min-w-0 grid-cols-1 gap-2">{primaryActions}</div> : null}
    </Card>
  );
}
