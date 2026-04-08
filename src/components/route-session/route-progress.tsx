export function RouteProgressBar({ current, total, label }: { current: number; total: number; label?: string }) {
  const progress = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--muted-foreground)]">{label ?? "Progress"}</span>
        <span className="font-medium">
          {current}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--surface-muted)]">
        <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
