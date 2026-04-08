import type { ReactNode } from "react";
import { ListRow } from "@/components/ui/list-row";

export function SettingsList({ items }: { items: Array<{ title: string; subtitle?: string; trailing?: ReactNode }> }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ListRow key={item.title} title={item.title} subtitle={item.subtitle} trailing={item.trailing} />
      ))}
    </div>
  );
}
