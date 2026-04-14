import Link from "next/link";
import type { Route as AppRoute } from "next";
import { FileSpreadsheet, MapPinPlusInside, Route } from "lucide-react";
import { Card } from "@/components/ui/card";

export function QuickActions({
  addPlaceLabel,
  addPlaceHint,
  addPlaceHref = "/lists",
  importCsvLabel,
  importCsvHint,
  importCsvHref = "/lists",
  planTodayLabel,
  planTodayHint,
  planTodayHref = "/today"
}: {
  addPlaceLabel: string;
  addPlaceHint: string;
  addPlaceHref?: string;
  importCsvLabel: string;
  importCsvHint: string;
  importCsvHref?: string;
  planTodayLabel: string;
  planTodayHint: string;
  planTodayHref?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link href={addPlaceHref as AppRoute}>
        <Card className="flex min-h-20 flex-col justify-between bg-white p-3 shadow-[var(--shadow-soft)]">
          <MapPinPlusInside className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="font-semibold">{addPlaceLabel}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{addPlaceHint}</p>
          </div>
        </Card>
      </Link>
      <Link href={importCsvHref as AppRoute}>
        <Card className="flex min-h-20 flex-col justify-between bg-white p-3 shadow-[var(--shadow-soft)]">
          <FileSpreadsheet className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="font-semibold">{importCsvLabel}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{importCsvHint}</p>
          </div>
        </Card>
      </Link>
      <Link href={planTodayHref as AppRoute}>
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
