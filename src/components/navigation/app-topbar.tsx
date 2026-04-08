import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export function AppTopBar({
  title,
  subtitle,
  backHref,
  action,
  backLabel
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
  backLabel?: string;
}) {
  return (
    <header className="flex items-start gap-3 pb-2">
      {backHref ? (
        <Link href={backHref as Route} aria-label={backLabel ?? "Go back"}>
          <IconButton>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
        </Link>
      ) : null}
      <div className="min-w-0 flex-1 space-y-0.5 pt-1">
        {subtitle ? <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p> : null}
        <h1 className="truncate text-[24px] font-semibold leading-tight">{title}</h1>
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </header>
  );
}
