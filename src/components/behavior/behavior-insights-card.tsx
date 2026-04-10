import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function BehaviorInsightsCard({
  title,
  subtitle,
  categories,
  topCategoriesLabel,
  favoritesLabel,
  favoritesCount,
  visitsLabel,
  visitsCount
}: {
  title: string;
  subtitle: string;
  categories: string[];
  topCategoriesLabel: string;
  favoritesLabel: string;
  favoritesCount: number;
  visitsLabel: string;
  visitsCount: number;
}) {
  if (categories.length === 0 && favoritesCount === 0 && visitsCount === 0) {
    return null;
  }

  return (
    <Card className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{title}</p>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{subtitle}</p>
      </div>
      {categories.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{topCategoriesLabel}</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} tone="accent">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[20px] bg-[var(--surface-subtle)] p-3">
          <p className="text-xs text-[var(--muted-foreground)]">{favoritesLabel}</p>
          <p className="mt-1 text-2xl font-semibold">{favoritesCount}</p>
        </div>
        <div className="rounded-[20px] bg-[var(--surface-subtle)] p-3">
          <p className="text-xs text-[var(--muted-foreground)]">{visitsLabel}</p>
          <p className="mt-1 text-2xl font-semibold">{visitsCount}</p>
        </div>
      </div>
    </Card>
  );
}
