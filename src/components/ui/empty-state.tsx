import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="space-y-3 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="secondary" onClick={onAction} fullWidth>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
