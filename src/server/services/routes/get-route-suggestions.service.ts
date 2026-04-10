import type { AuthorizedUser } from "@/server/domain/types";
import { env } from "@/lib/env/env";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { PlaceRepository } from "@/server/repositories/place.repository";
import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";
import { GooglePlaceLookupAdapter, type PlaceLookupResult } from "@/server/services/google/place-lookup.adapter";

const routePlanRepository = new RoutePlanRepository();
const listPlaceRepository = new ListPlaceRepository();
const placeRepository = new PlaceRepository();
const placeLookupAdapter = new GooglePlaceLookupAdapter();

type RouteSuggestion = PlaceLookupResult & {
  categoryLabel: string;
  reason: string;
  detourLabel: string;
  signals: string[];
};

type RouteSuggestionsResult = {
  suggestions: RouteSuggestion[];
};

function calculateDistanceInKm(
  left: { latitude: number; longitude: number },
  right: { latitude: number; longitude: number }
) {
  const latitudeDelta = (left.latitude - right.latitude) * 111;
  const longitudeDelta = (left.longitude - right.longitude) * 71;

  return Math.sqrt(latitudeDelta ** 2 + longitudeDelta ** 2);
}

function formatDetourLabel(distanceInKm: number) {
  if (distanceInKm < 0.4) {
    return "Nauwelijks om";
  }

  if (distanceInKm < 1.5) {
    return "Kleine omweg";
  }

  if (distanceInKm < 4) {
    return "Ongeveer 5-10 min extra";
  }

  return "Ongeveer 10-20 min extra";
}

function normalizeName(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

async function getPreferredCategoriesByBehavior(userId: string) {
  const signals = await listPlaceRepository.getUserPreferenceSignals(userId);
  const categoryScores = new Map<string, number>();

  for (const item of signals) {
    const categoryName = item.place.category?.name;

    if (!categoryName) {
      continue;
    }

    const score =
      (item.isFavorite ? 4 : 0) +
      (item.visitedByUserId === userId ? 3 : 0) +
      (item.status === "VISITED" ? 2 : 0) +
      (item.includeInRoute ? 1 : 0);

    categoryScores.set(categoryName, (categoryScores.get(categoryName) ?? 0) + score);
  }

  return new Set(
    [...categoryScores.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([categoryName]) => categoryName)
  );
}

function buildSuggestionContext(input: {
  categoryLabel: string;
  city?: string | null;
  nearestDistance: number;
  isPreferredCategory: boolean;
}) {
  const signals: string[] = [];

  if (input.isPreferredCategory) {
    signals.push("Sluit aan op wat je vaker bewaart");
  }

  if (input.nearestDistance < 1.5) {
    signals.push("Ligt logisch op je route");
  }

  if (input.city) {
    signals.push(`Past bij je stops in ${input.city}`);
  }

  const reason = input.isPreferredCategory
    ? `Je kiest vaker ${input.categoryLabel.toLowerCase()} en deze suggestie ligt ook logisch op je route.`
    : input.city
      ? `Past bij ${input.categoryLabel.toLowerCase()} in ${input.city}.`
      : `Past bij ${input.categoryLabel.toLowerCase()} onderweg.`;

  return {
    reason,
    signals
  };
}

export async function getRouteSuggestionsService(user: AuthorizedUser, routePlanId: string): Promise<RouteSuggestionsResult> {
  const routePlan = await routePlanRepository.findById(routePlanId, user.id);

  if (!routePlan) {
    return { suggestions: [] };
  }
  const preferredCategories = await getPreferredCategoriesByBehavior(user.id);

  const existingExternalIds = new Set(
    routePlan.stops.map((stop) => stop.listPlace.place.externalSourceId).filter((value): value is string => Boolean(value))
  );
  const existingPlaceIds = new Set(routePlan.stops.map((stop) => stop.listPlace.place.id));
  const existingNames = new Set(routePlan.stops.map((stop) => normalizeName(stop.listPlace.place.name)));
  const routeCoordinates = routePlan.stops
    .map((stop) => {
      const latitude = Number(stop.listPlace.place.latitude);
      const longitude = Number(stop.listPlace.place.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return { latitude, longitude };
    })
    .filter((value): value is { latitude: number; longitude: number } => Boolean(value));

  const categoryContexts = routePlan.stops.reduce<Array<{ categoryLabel: string; city: string | null; country: string | null }>>(
    (collection, stop) => {
      const categoryLabel = stop.listPlace.place.category?.name;

      if (!categoryLabel) {
        return collection;
      }

      collection.push({
        categoryLabel,
        city: stop.listPlace.place.city,
        country: stop.listPlace.place.country
      });

      return collection;
    },
    []
  );

  const fallbackContext = routePlan.stops
    .map((stop) => ({
      city: stop.listPlace.place.city,
      country: stop.listPlace.place.country
    }))
    .find((item) => item.city || item.country);

  const queries = categoryContexts.slice(0, 4);

  if (queries.length === 0 && !fallbackContext) {
    return { suggestions: [] };
  }

  if (!env.GOOGLE_MAPS_PLACE_API_KEY) {
    const databaseSuggestions = await placeRepository.findSuggestions({
      excludePlaceIds: [...existingPlaceIds],
      city: fallbackContext?.city ?? null,
      country: fallbackContext?.country ?? null,
      categoryNames: queries.map((query) => query.categoryLabel),
      limit: 12
    });

    const suggestions = databaseSuggestions
      .filter((place) => !existingNames.has(normalizeName(place.name)))
      .map((place) => {
        const nearestDistance =
          routeCoordinates.length > 0 && place.latitude != null && place.longitude != null
            ? Math.min(
                ...routeCoordinates.map((coordinates) =>
                  calculateDistanceInKm(coordinates, {
                    latitude: Number(place.latitude),
                    longitude: Number(place.longitude)
                  })
                )
              )
            : 0;

        const categoryLabel = "category" in place && place.category?.name ? place.category.name : "Onderweg";
        const isPreferredCategory = preferredCategories.has(categoryLabel);
        const preferenceBoost = isPreferredCategory ? 5 : 0;
        const context = buildSuggestionContext({
          categoryLabel,
          city: place.city,
          nearestDistance,
          isPreferredCategory
        });

        return {
          externalSourceId: place.externalSourceId ?? `local-${place.id}`,
          name: place.name,
          addressLine: place.addressLine ?? undefined,
          city: place.city ?? undefined,
          country: place.country ?? undefined,
          latitude: place.latitude != null ? Number(place.latitude) : undefined,
          longitude: place.longitude != null ? Number(place.longitude) : undefined,
          googleMapsUrl: place.googleMapsUrl ?? undefined,
          categoryLabel,
          reason: context.reason,
          detourLabel: formatDetourLabel(nearestDistance),
          signals: context.signals,
          score: preferenceBoost - nearestDistance
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map(({ score: _score, ...suggestion }) => suggestion);

    return { suggestions };
  }

  const searchResults = await Promise.all(
    (queries.length > 0
      ? queries.map((query) =>
          placeLookupAdapter.search(query.categoryLabel, {
            city: query.city ?? undefined,
            country: query.country ?? undefined
          })
        )
      : [placeLookupAdapter.search("bezienswaardigheden", { city: fallbackContext?.city ?? undefined, country: fallbackContext?.country ?? undefined })]
    )
  );

  const ranked = searchResults
    .flatMap((result, index) =>
      result.map((place) => ({
        place,
        categoryLabel: queries[index]?.categoryLabel ?? "Onderweg",
        city: queries[index]?.city ?? fallbackContext?.city ?? undefined
      }))
    )
    .filter(({ place }) => {
      if (!place.name || existingNames.has(normalizeName(place.name))) {
        return false;
      }

      if (place.externalSourceId && existingExternalIds.has(place.externalSourceId)) {
        return false;
      }

      return typeof place.latitude === "number" && typeof place.longitude === "number";
    })
    .map(({ place, categoryLabel, city }) => {
      const nearestDistance =
        routeCoordinates.length > 0
          ? Math.min(
              ...routeCoordinates.map((coordinates) =>
                calculateDistanceInKm(coordinates, {
                  latitude: place.latitude as number,
                  longitude: place.longitude as number
                })
              )
            )
          : 0;

      const isPreferredCategory = preferredCategories.has(categoryLabel);
      const preferenceBoost = isPreferredCategory ? 5 : 0;
      const context = buildSuggestionContext({
        categoryLabel,
        city,
        nearestDistance,
        isPreferredCategory
      });

      return {
        ...place,
        categoryLabel,
        reason: context.reason,
        detourLabel: formatDetourLabel(nearestDistance),
        signals: context.signals,
        score: preferenceBoost - nearestDistance
      };
    })
    .sort((left, right) => right.score - left.score);

  const deduped = ranked.filter(
    (item, index, collection) =>
      collection.findIndex((candidate) => candidate.externalSourceId === item.externalSourceId || normalizeName(candidate.name) === normalizeName(item.name)) ===
      index
  );

  const suggestions = deduped.slice(0, 3).map(({ score: _score, ...suggestion }) => suggestion);

  return { suggestions };
}
