import { Card } from "@/components/ui/card";

export function RouteStopCard({ index, name }: { index: number; name: string }) {
  return (
    <Card className="flex items-center gap-3 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
        {index}
      </div>
      <p className="font-medium">{name}</p>
    </Card>
  );
}
