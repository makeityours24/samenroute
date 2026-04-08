import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher({
  locale,
  currentPath = "/",
  label,
  options,
  className
}: {
  locale: Locale;
  currentPath?: string;
  label: string;
  options: Array<{ value: Locale; label: string; ariaLabel?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted-foreground)]">
        <Globe className="h-4 w-4" />
      </span>
      <div className="grid min-w-0 grid-cols-3 gap-2">
        {options.map((option) => (
          <a
            key={option.value}
            href={`/api/locale?locale=${option.value}&redirectTo=${encodeURIComponent(currentPath)}`}
            className={cn(
              "flex min-h-10 items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold",
              locale === option.value
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-white text-[var(--muted-foreground)]"
            )}
            aria-label={`${label}: ${option.ariaLabel ?? option.label}`}
          >
            {option.label}
          </a>
        ))}
      </div>
    </div>
  );
}
