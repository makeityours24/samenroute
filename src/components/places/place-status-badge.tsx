import { Badge } from "@/components/ui/badge";

export function PlaceStatusBadge({
  status,
  labels
}: {
  status: "PLANNED" | "VISITED" | "SKIPPED";
  labels?: { planned: string; visited: string; skipped: string };
}) {
  const copy = labels ?? { planned: "Planned", visited: "Visited", skipped: "Skipped" };

  if (status === "VISITED") {
    return <Badge tone="success">{copy.visited}</Badge>;
  }
  if (status === "SKIPPED") {
    return <Badge tone="warning">{copy.skipped}</Badge>;
  }
  return <Badge tone="accent">{copy.planned}</Badge>;
}
