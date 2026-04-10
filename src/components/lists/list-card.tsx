import Link from "next/link";
import type { Route } from "next";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ListCard({
  href,
  name,
  description,
  placeCount,
  visitedCount,
  shared,
  membershipLabel,
  copy
}: {
  href: string;
  name: string;
  description?: string | null;
  placeCount: number;
  visitedCount: number;
  shared: boolean;
  membershipLabel?: string;
  copy?: {
    shared: string;
    private: string;
    noDescription: string;
    placesCount: string;
    visitedCount: string;
    rolePrefix?: string;
  };
}) {
  const labels = copy ?? {
    shared: "Shared",
    private: "Private",
    noDescription: "No description yet.",
    placesCount: "places",
    visitedCount: "visited",
    rolePrefix: "You are"
  };

  return (
    <Link href={href as Route}>
      <Card className="border-transparent p-3 shadow-[var(--shadow-soft)] transition active:scale-[0.99]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 pb-1">
              <h2 className="truncate text-[15px] font-semibold leading-tight">{name}</h2>
              {shared ? (
                <Badge tone="accent" className="gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {labels.shared}
                </Badge>
              ) : (
                <Badge>{labels.private}</Badge>
              )}
            </div>
            <p className="line-clamp-2 text-sm leading-5 text-[var(--muted-foreground)]">{description ?? labels.noDescription}</p>
            <div className="mt-2 flex gap-3 text-xs text-[var(--muted-foreground)]">
              <span>{placeCount} {labels.placesCount}</span>
              <span>{visitedCount} {labels.visitedCount}</span>
            </div>
            {membershipLabel ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">{labels.rolePrefix} {membershipLabel}</p> : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
