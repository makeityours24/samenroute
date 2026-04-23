"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";

const PLACE_LOOKUP_DEBOUNCE_MS = 450;
const PLACE_LOOKUP_TIMEOUT_MS = 8000;

type CategoryOption = { id: string; name: string };
type LookupItem = {
  externalSourceId: string;
  name: string;
  addressLine?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
};

export function PlaceForm({
  action,
  listId,
  categories,
  footer,
  error,
  initialValues,
  enableLookup = false,
  copy
}: {
  action: (formData: FormData) => void | Promise<void>;
  listId: string;
  categories: CategoryOption[];
  footer: ReactNode;
  error?: string;
  initialValues?: {
    name?: string;
    addressLine?: string;
    city?: string;
    country?: string;
    categoryId?: string;
    note?: string;
    priority?: number;
    includeInRoute?: boolean;
    isFavorite?: boolean;
    externalSourceId?: string;
    latitude?: number | null;
    longitude?: number | null;
    googleMapsUrl?: string;
  };
  enableLookup?: boolean;
  copy?: {
    flowHint: string;
    resetForm: string;
    name: string;
    lookupTitle: string;
    lookupHint: string;
    lookupFlowHint: string;
    lookupLoading: string;
    lookupEmpty: string;
    useSuggestion: string;
    suggestionContext: string;
    addressRefined: string;
    namePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    city: string;
    cityPlaceholder: string;
    country: string;
    countryPlaceholder: string;
    category: string;
    categoryPlaceholder: string;
    note: string;
    notePlaceholder: string;
    priority: string;
    includeInRoute: string;
    favorite: string;
  };
}) {
  const labels = copy ?? {
    flowHint: "Start with the name or address. If a suggestion looks right, tap it to fill the rest faster.",
    resetForm: "Start a new place",
    lookupTitle: "Smart suggestions",
    lookupHint: "We suggest places based on what you type and use city or country to narrow the results.",
    lookupFlowHint: "You do not need to fill everything yourself. A good suggestion can complete the address and location details.",
    lookupLoading: "Loading suggestions...",
    lookupEmpty: "No matching suggestions found.",
    useSuggestion: "Use suggestion",
    suggestionContext: "Search area",
    addressRefined: "Address and location details were updated from this suggestion.",
    name: "Name",
    namePlaceholder: "Markthal",
    address: "Address",
    addressPlaceholder: "Street and number",
    city: "City",
    cityPlaceholder: "Rotterdam",
    country: "Country",
    countryPlaceholder: "Netherlands",
    category: "Category",
    categoryPlaceholder: "Choose a category",
    note: "Note",
    notePlaceholder: "Why this place matters or what to order",
    priority: "Priority",
    includeInRoute: "Include in route",
    favorite: "Favorite"
  };

  const [name, setName] = useState(initialValues?.name ?? "");
  const [addressLine, setAddressLine] = useState(initialValues?.addressLine ?? "");
  const [city, setCity] = useState(initialValues?.city ?? "");
  const [country, setCountry] = useState(initialValues?.country ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [priority, setPriority] = useState(String(initialValues?.priority ?? 0));
  const [includeInRoute, setIncludeInRoute] = useState(initialValues?.includeInRoute ?? true);
  const [isFavorite, setIsFavorite] = useState(initialValues?.isFavorite ?? false);
  const [externalSourceId, setExternalSourceId] = useState(initialValues?.externalSourceId ?? "");
  const [latitude, setLatitude] = useState(initialValues?.latitude != null ? String(initialValues.latitude) : "");
  const [longitude, setLongitude] = useState(initialValues?.longitude != null ? String(initialValues.longitude) : "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialValues?.googleMapsUrl ?? "");
  const [lookupResults, setLookupResults] = useState<LookupItem[]>([]);
  const [lookupPending, setLookupPending] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setAddressLine(initialValues?.addressLine ?? "");
    setCity(initialValues?.city ?? "");
    setCountry(initialValues?.country ?? "");
    setCategoryId(initialValues?.categoryId ?? "");
    setNote(initialValues?.note ?? "");
    setPriority(String(initialValues?.priority ?? 0));
    setIncludeInRoute(initialValues?.includeInRoute ?? true);
    setIsFavorite(initialValues?.isFavorite ?? false);
    setExternalSourceId(initialValues?.externalSourceId ?? "");
    setLatitude(initialValues?.latitude != null ? String(initialValues.latitude) : "");
    setLongitude(initialValues?.longitude != null ? String(initialValues.longitude) : "");
    setGoogleMapsUrl(initialValues?.googleMapsUrl ?? "");
    setLookupResults([]);
    setLookupPending(false);
    setLookupMessage(null);
  }, [initialValues]);

  function clearSuggestionContext() {
    if (!externalSourceId && !latitude && !longitude && !googleMapsUrl) {
      return;
    }

    setExternalSourceId("");
    setLatitude("");
    setLongitude("");
    setGoogleMapsUrl("");
    setCity("");
    setCountry("");
    setLookupMessage(null);
  }

  function resetForm() {
    setName("");
    setAddressLine("");
    setCity("");
    setCountry("");
    setCategoryId("");
    setNote("");
    setPriority("0");
    setIncludeInRoute(true);
    setIsFavorite(false);
    setExternalSourceId("");
    setLatitude("");
    setLongitude("");
    setGoogleMapsUrl("");
    setLookupResults([]);
    setLookupPending(false);
    setLookupMessage(null);
  }

  const lookupQuery = useMemo(() => {
    const primary = name.trim();
    const secondary = addressLine.trim();
    return primary || secondary;
  }, [addressLine, name]);

  useEffect(() => {
    if (!enableLookup) {
      setLookupResults([]);
      setLookupPending(false);
      return;
    }

    const trimmedQuery = lookupQuery.trim();

    if (trimmedQuery.length < 3) {
      setLookupResults([]);
      setLookupPending(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const requestTimeout = window.setTimeout(() => controller.abort(), PLACE_LOOKUP_TIMEOUT_MS);

      try {
        setLookupPending(true);
        const search = new URLSearchParams({ q: trimmedQuery });

        if (city.trim()) {
          search.set("city", city.trim());
        }

        if (country.trim()) {
          search.set("country", country.trim());
        }

        const response = await fetch(`/api/place-lookup?${search.toString()}`, {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          setLookupResults([]);
          setLookupMessage(null);
          return;
        }

        const payload = (await response.json()) as { data: LookupItem[] };
        setLookupResults(payload.data ?? []);
      } catch (lookupError) {
        if ((lookupError as Error).name !== "AbortError") {
          setLookupResults([]);
        }
      } finally {
        window.clearTimeout(requestTimeout);
        setLookupPending(false);
      }
    }, PLACE_LOOKUP_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [city, country, enableLookup, lookupQuery]);

  function applySuggestion(item: LookupItem) {
    const hadContext = city.trim().length > 0 || country.trim().length > 0 || addressLine.trim().length > 0;
    const changedAddress =
      item.addressLine !== undefined && item.addressLine !== addressLine ||
      item.city !== undefined && item.city !== city ||
      item.country !== undefined && item.country !== country;

    setName(item.name);
    setAddressLine(item.addressLine ?? "");
    setCity(item.city ?? "");
    setCountry(item.country ?? "");
    setExternalSourceId(item.externalSourceId);
    setLatitude(item.latitude !== undefined ? String(item.latitude) : "");
    setLongitude(item.longitude !== undefined ? String(item.longitude) : "");
    setGoogleMapsUrl(item.googleMapsUrl ?? "");
    setLookupMessage(hadContext && changedAddress ? labels.addressRefined : null);
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="externalSourceId" value={externalSourceId} />
      <input type="hidden" name="latitude" value={latitude} />
      <input type="hidden" name="longitude" value={longitude} />
      <input type="hidden" name="googleMapsUrl" value={googleMapsUrl} />
      <Card className="bg-[var(--surface-subtle)] p-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">{labels.flowHint}</p>
          {name || addressLine || city || country || note || externalSourceId ? (
            <button
              type="button"
              className="shrink-0 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface)]"
              onClick={resetForm}
            >
              {labels.resetForm}
            </button>
          ) : null}
        </div>
      </Card>
      <div className="space-y-2">
        <label htmlFor="place-name" className="text-sm font-medium">
          {labels.name}
        </label>
        <Input
          id="place-name"
          name="name"
          placeholder={labels.namePlaceholder}
          required
          value={name}
          onChange={(event) => {
            clearSuggestionContext();
            setName(event.target.value);
          }}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="place-address" className="text-sm font-medium">
          {labels.address}
        </label>
        <Input
          id="place-address"
          name="addressLine"
          placeholder={labels.addressPlaceholder}
          value={addressLine}
          onChange={(event) => {
            clearSuggestionContext();
            setAddressLine(event.target.value);
          }}
        />
      </div>
      {enableLookup ? (
        <Card className="space-y-3 bg-[var(--surface-subtle)] p-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{labels.lookupTitle}</p>
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.lookupHint}</p>
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.lookupFlowHint}</p>
            {city.trim() || country.trim() ? (
              <p className="text-xs text-[var(--accent)]">
                {labels.suggestionContext}: {[city.trim(), country.trim()].filter(Boolean).join(", ")}
              </p>
            ) : null}
          </div>
          {lookupPending ? <Toast message={labels.lookupLoading} /> : null}
          {!lookupPending && lookupQuery.trim().length >= 3 && lookupResults.length === 0 ? <Toast message={labels.lookupEmpty} /> : null}
          {lookupResults.length > 0 ? (
            <div className="space-y-2" data-testid="place-lookup-results">
              {lookupResults.slice(0, 4).map((item) => (
                <button
                  key={item.externalSourceId}
                  type="button"
                  className="w-full rounded-[20px] border border-[var(--border)] bg-white px-3 py-3 text-left shadow-[var(--shadow-soft)] transition active:scale-[0.99]"
                  onClick={() => applySuggestion(item)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        {[item.addressLine, item.city, item.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-[var(--accent)]">{labels.useSuggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="place-city" className="text-sm font-medium">
            {labels.city}
          </label>
          <Input id="place-city" name="city" placeholder={labels.cityPlaceholder} value={city} onChange={(event) => setCity(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="place-country" className="text-sm font-medium">
            {labels.country}
          </label>
          <Input id="place-country" name="country" placeholder={labels.countryPlaceholder} value={country} onChange={(event) => setCountry(event.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="place-category" className="text-sm font-medium">
          {labels.category}
        </label>
        <Select id="place-category" name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">{labels.categoryPlaceholder}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <label htmlFor="place-note" className="text-sm font-medium">
          {labels.note}
        </label>
        <Textarea id="place-note" name="note" placeholder={labels.notePlaceholder} value={note} onChange={(event) => setNote(event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="place-priority" className="text-sm font-medium">
            {labels.priority}
          </label>
          <Input id="place-priority" name="priority" type="number" min={0} max={5} value={priority} onChange={(event) => setPriority(event.target.value)} />
        </div>
        <div className="grid content-end gap-2 rounded-2xl bg-[var(--surface-subtle)] p-4">
          <label className="flex items-center gap-3 text-sm">
            <Checkbox name="includeInRoute" checked={includeInRoute} onChange={(event) => setIncludeInRoute(event.currentTarget.checked)} />
            {labels.includeInRoute}
          </label>
          <label className="flex items-center gap-3 text-sm">
            <Checkbox name="isFavorite" checked={isFavorite} onChange={(event) => setIsFavorite(event.currentTarget.checked)} />
            {labels.favorite}
          </label>
        </div>
      </div>
      {lookupMessage ? <Toast tone="success" message={lookupMessage} /> : null}
      {error ? <Toast tone="error" message={error} /> : null}
      <StickyActionBar>{footer}</StickyActionBar>
    </form>
  );
}
