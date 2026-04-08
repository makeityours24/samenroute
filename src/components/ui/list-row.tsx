import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  showChevron = false
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  showChevron?: boolean;
}) {
  return (
    <Card className="flex items-center gap-3 p-3">
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        {subtitle ? <p className="truncate text-sm text-[var(--muted-foreground)]">{subtitle}</p> : null}
      </div>
      {trailing}
      {showChevron ? <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" /> : null}
    </Card>
  );
}
