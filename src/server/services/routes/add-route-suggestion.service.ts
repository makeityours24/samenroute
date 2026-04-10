import { ConflictError } from "@/server/services/errors";
import type { AuthorizedUser } from "@/server/domain/types";
import { addPlaceToListService } from "@/server/services/list-places/add-place-to-list.service";
import { createPlaceService } from "@/server/services/places/create-place.service";
import { GoogleMapsAdapter } from "@/server/services/google/maps-adapter";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { PlaceRepository } from "@/server/repositories/place.repository";
import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";

const routePlanRepository = new RoutePlanRepository();
const placeRepository = new PlaceRepository();
const listPlaceRepository = new ListPlaceRepository();
const googleMapsAdapter = new GoogleMapsAdapter();

export async function addRouteSuggestionService(
  user: AuthorizedUser,
  input: {
    routePlanId: string;
    externalSourceId?: string;
    name: string;
    addressLine?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
  }
) {
  const routePlan = await routePlanRepository.findById(input.routePlanId, user.id);

  if (!routePlan) {
    throw new ConflictError("Route not found.");
  }

  const existingPlace =
    input.externalSourceId ? await placeRepository.findByExternalSourceId(input.externalSourceId) : null;

  const place =
    existingPlace ??
    (await createPlaceService(user, {
      sourceType: input.externalSourceId ? "GOOGLE_PLACE" : "MANUAL",
      externalSourceId: input.externalSourceId,
      name: input.name,
      addressLine: input.addressLine,
      city: input.city,
      country: input.country,
      latitude: input.latitude,
      longitude: input.longitude,
      googleMapsUrl: input.googleMapsUrl
    }));

  const existingListPlace = await listPlaceRepository.findByListAndPlace(routePlan.listId, place.id);

  const listPlace =
    existingListPlace ??
    (await addPlaceToListService(user, {
      listId: routePlan.listId,
      placeId: place.id,
      includeInRoute: true
    }));

  const alreadyInRoute = routePlan.stops.some((stop) => stop.listPlaceId === listPlace.id);

  if (alreadyInRoute) {
    return routePlan;
  }

  const googleMapsUrl = googleMapsAdapter.buildRouteUrl({
    transportMode: routePlan.transportMode,
    start:
      routePlan.startLatitude != null && routePlan.startLongitude != null
        ? {
            label: routePlan.startPlaceLabel ?? "Current location",
            latitude: Number(routePlan.startLatitude),
            longitude: Number(routePlan.startLongitude)
          }
        : undefined,
    stops: [
      ...routePlan.stops.map((stop) => ({
        label: stop.listPlace.place.name,
        latitude: stop.listPlace.place.latitude != null ? Number(stop.listPlace.place.latitude) : null,
        longitude: stop.listPlace.place.longitude != null ? Number(stop.listPlace.place.longitude) : null
      })),
      {
        label: place.name,
        latitude: place.latitude != null ? Number(place.latitude) : null,
        longitude: place.longitude != null ? Number(place.longitude) : null
      }
    ]
  });

  return routePlanRepository.appendStop(routePlan.id, {
    listPlaceId: listPlace.id,
    googleMapsUrl
  });
}
