import { env } from "@/lib/env/env";
import type { Locale } from "@/lib/i18n/dictionaries";

export type PlaceLookupResult = {
  externalSourceId: string;
  name: string;
  addressLine?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
};

export class GooglePlaceLookupAdapter {
  async search(text: string, context?: { city?: string; country?: string; locale?: Locale }): Promise<PlaceLookupResult[]> {
    if (!env.GOOGLE_MAPS_PLACE_API_KEY) {
      return [];
    }

    const city = context?.city?.trim();
    const country = context?.country?.trim();
    const languageCode = resolvePlacesLanguageCode(context?.locale, country);
    const textQuery = [text.trim(), city, country].filter(Boolean).join(", ");

    const response = await fetch(env.GOOGLE_MAPS_PLACE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": env.GOOGLE_MAPS_PLACE_API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.addressComponents"
      },
      body: JSON.stringify({
        textQuery,
        languageCode
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      places?: Array<{
        id: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        googleMapsUri?: string;
        location?: { latitude?: number; longitude?: number };
        addressComponents?: Array<{ longText?: string; types?: string[] }>;
      }>;
    };

    const results = (payload.places ?? []).map((place) => ({
      externalSourceId: place.id,
      name: place.displayName?.text ?? "Unknown place",
      addressLine: place.formattedAddress,
      city: place.addressComponents?.find((item) => item.types?.includes("locality"))?.longText,
      country: place.addressComponents?.find((item) => item.types?.includes("country"))?.longText,
      latitude: place.location?.latitude,
      longitude: place.location?.longitude,
      googleMapsUrl: place.googleMapsUri
    }));

    const normalizedCity = city?.toLowerCase();
    const normalizedCountry = country?.toLowerCase();

    if (!normalizedCity && !normalizedCountry) {
      return results;
    }

    const contextualMatches = results.filter((place) => {
      const matchesCity = normalizedCity ? place.city?.toLowerCase().includes(normalizedCity) : true;
      const matchesCountry = normalizedCountry ? place.country?.toLowerCase().includes(normalizedCountry) : true;
      return matchesCity && matchesCountry;
    });

    return contextualMatches.length > 0 ? contextualMatches : results;
  }
}

function resolvePlacesLanguageCode(locale?: Locale, country?: string) {
  const normalizedCountry = country?.trim().toLowerCase();

  if (normalizedCountry) {
    if (["turkiye", "türkiye", "turkey"].includes(normalizedCountry)) {
      return "tr";
    }

    if (["nederland", "netherlands", "holland"].includes(normalizedCountry)) {
      return "nl";
    }
  }

  if (locale === "tr") return "tr";
  if (locale === "nl") return "nl";
  return "en";
}
