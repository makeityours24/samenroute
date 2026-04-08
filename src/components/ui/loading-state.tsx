import { LoaderCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card className="flex items-center gap-3">
      <LoaderCircle className="h-5 w-5 animate-spin text-[var(--accent)]" />
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
    </Card>
  );
}
