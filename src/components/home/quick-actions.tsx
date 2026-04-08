import Link from "next/link";
import { MapPinPlusInside, Route } from "lucide-react";
import { Card } from "@/components/ui/card";

export function QuickActions({
  addPlaceLabel,
  addPlaceHint,
  planTodayLabel,
  planTodayHint
}: {
  addPlaceLabel: string;
  addPlaceHint: string;
  planTodayLabel: string;
  planTodayHint: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/lists">
        <Card className="flex min-h-20 flex-col justify-between bg-white p-3 shadow-[var(--shadow-soft)]">
          <MapPinPlusInside className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="font-semibold">{addPlaceLabel}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{addPlaceHint}</p>
          </div>
        </Card>
      </Link>
      <Link href="/today">
        <Card className="flex min-h-20 flex-col justify-between border-transparent bg-[linear-gradient(180deg,#256b56_0%,#1f5d4c_100%)] p-3 text-white shadow-[var(--shadow)]">
          <Route className="h-5 w-5" />
          <div>
            <p className="font-semibold">{planTodayLabel}</p>
            <p className="text-xs text-white/80">{planTodayHint}</p>
          </div>
        </Card>
      </Link>
    </div>
  );
}
