import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CurrentStopCard({
  name,
  location,
  label,
  helper
}: {
  name: string;
  location: string;
  label?: string;
  helper?: string;
}) {
  return (
    <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-5 shadow-[var(--shadow)]">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label ?? "Current stop"}</p>
      <div className="space-y-2">
        <h2 className="text-[30px] font-semibold leading-[1.08]">{name}</h2>
        <div className="flex items-center gap-2 text-sm leading-5 text-[var(--muted-foreground)]">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        {helper ? <p className="text-sm leading-6 text-[var(--muted-foreground)]">{helper}</p> : null}
      </div>
    </Card>
  );
}
