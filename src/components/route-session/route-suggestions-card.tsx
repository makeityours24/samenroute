import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Suggestion = {
  externalSourceId: string;
  name: string;
  addressLine?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  categoryLabel: string;
  reason: string;
  detourLabel: string;
};

export function RouteSuggestionsCard({
  routePlanId,
  suggestions,
  action,
  copy
}: {
  routePlanId: string;
  suggestions: Suggestion[];
  action: (formData: FormData) => void | Promise<void>;
  copy: {
    badge: string;
    title: string;
    subtitle: string;
    add: string;
  };
}) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="space-y-3">
      <div className="space-y-1">
        <Badge tone="accent">{copy.badge}</Badge>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{copy.title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{copy.subtitle}</p>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.externalSourceId} className="rounded-2xl bg-[var(--surface-subtle)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">{suggestion.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {[suggestion.addressLine, suggestion.city ?? suggestion.country].filter(Boolean).join(", ")}
                </p>
              </div>
              <Badge>{suggestion.categoryLabel}</Badge>
            </div>
            <div className="mt-3 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
              <p>{suggestion.reason}</p>
              <p>{suggestion.detourLabel}</p>
            </div>
            <form action={action} className="mt-3">
              <input type="hidden" name="routePlanId" value={routePlanId} />
              <input type="hidden" name="externalSourceId" value={suggestion.externalSourceId} />
              <input type="hidden" name="name" value={suggestion.name} />
              <input type="hidden" name="addressLine" value={suggestion.addressLine ?? ""} />
              <input type="hidden" name="city" value={suggestion.city ?? ""} />
              <input type="hidden" name="country" value={suggestion.country ?? ""} />
              <input type="hidden" name="latitude" value={String(suggestion.latitude ?? "")} />
              <input type="hidden" name="longitude" value={String(suggestion.longitude ?? "")} />
              <input type="hidden" name="googleMapsUrl" value={suggestion.googleMapsUrl ?? ""} />
              <Button fullWidth type="submit" variant="secondary">
                {copy.add}
              </Button>
            </form>
          </div>
        ))}
      </div>
    </Card>
  );
}
