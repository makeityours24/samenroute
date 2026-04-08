import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ErrorState({
  title = "Something went wrong",
  description,
  retryLabel,
  onRetry
}: {
  title?: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[var(--danger)]" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      {retryLabel && onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </Card>
  );
}
