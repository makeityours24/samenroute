import { generateRoutePlanSchema } from "@/lib/validations/route-plan";
import type { TransportMode } from "@/server/domain/enums";
import type { AuthorizedUser } from "@/server/domain/types";
import type { z } from "zod";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";
import { GoogleMapsAdapter } from "@/server/services/google/maps-adapter";
import { NotFoundError } from "@/server/services/errors";
import { requireMutableList } from "@/server/services/shared";

const listPlaceRepository = new ListPlaceRepository();
const routePlanRepository = new RoutePlanRepository();
const activityLogRepository = new ActivityLogRepository();
const googleMapsAdapter = new GoogleMapsAdapter();

type RouteOrderingStrategy = z.infer<typeof generateRoutePlanSchema>["routeOrderingStrategy"];

function calculateDistance(
  origin: { latitude: number; longitude: number },
  target: { latitude: number; longitude: number }
) {
  return Math.sqrt((origin.latitude - target.latitude) ** 2 + (origin.longitude - target.longitude) ** 2);
}

export function orderRouteCandidates(input: {
  transportMode: TransportMode;
  routeOrderingStrategy: RouteOrderingStrategy;
  candidates: Array<{
    id: string;
    priority: number;
    sortOrder: number;
    place: { name: string; latitude: unknown; longitude: unknown };
  }>;
  maxStops: number;
  start?: { latitude?: number; longitude?: number };
}) {
  const candidates = [...input.candidates];

  if (input.routeOrderingStrategy === "MANUAL") {
    return candidates.sort((left, right) => left.sortOrder - right.sortOrder).slice(0, input.maxStops);
  }

  if (input.routeOrderingStrategy === "PRIORITY_FIRST") {
    return candidates
      .sort((left, right) => right.priority - left.priority || left.sortOrder - right.sortOrder)
      .slice(0, input.maxStops);
  }

  if (typeof input.start?.latitude === "number" && typeof input.start.longitude === "number") {
    candidates.sort((left, right) => {
      const leftHasCoords =
        typeof left.place.latitude === "object" || typeof left.place.latitude === "number" || left.place.latitude === null;
      const rightHasCoords =
        typeof right.place.latitude === "object" || typeof right.place.latitude === "number" || right.place.latitude === null;

      if (!leftHasCoords || !rightHasCoords) {
        return left.sortOrder - right.sortOrder || right.priority - left.priority;
      }

      const leftDistance = calculateDistance(input.start as { latitude: number; longitude: number }, {
        latitude: Number(left.place.latitude),
        longitude: Number(left.place.longitude)
      });
      const rightDistance = calculateDistance(input.start as { latitude: number; longitude: number }, {
        latitude: Number(right.place.latitude),
        longitude: Number(right.place.longitude)
      });

      return leftDistance - rightDistance || right.priority - left.priority || left.sortOrder - right.sortOrder;
    });
  } else {
    candidates.sort((left, right) => left.sortOrder - right.sortOrder || right.priority - left.priority);
  }

  return candidates.slice(0, input.maxStops);
}

export async function generateRoutePlanService(user: AuthorizedUser, input: unknown) {
  const data = generateRoutePlanSchema.parse(input);
  await requireMutableList(data.listId, user);

  const candidates = await listPlaceRepository.getRouteCandidates(data.listId, data.listPlaceIds);

  if (candidates.length === 0) {
    throw new NotFoundError("No route candidates were found.");
  }

  const ordered = orderRouteCandidates({
    transportMode: data.transportMode,
    routeOrderingStrategy: data.routeOrderingStrategy,
    candidates,
    maxStops: data.maxStops,
    start: {
      latitude: data.startLatitude,
      longitude: data.startLongitude
    }
  });

  const googleMapsUrl = googleMapsAdapter.buildRouteUrl({
    transportMode: data.transportMode,
    start:
      typeof data.startLatitude === "number" && typeof data.startLongitude === "number"
        ? {
            label: data.startPlaceLabel ?? "Current location",
            latitude: data.startLatitude,
            longitude: data.startLongitude
          }
        : undefined,
    stops: ordered.map((candidate) => ({
      label: candidate.place.name,
      latitude: candidate.place.latitude ? Number(candidate.place.latitude) : null,
      longitude: candidate.place.longitude ? Number(candidate.place.longitude) : null
    }))
  });

  const routePlan = await routePlanRepository.create({
    listId: data.listId,
    createdByUserId: user.id,
    title: data.title,
    transportMode: data.transportMode,
    startPlaceLabel: data.startPlaceLabel,
    startLatitude: data.startLatitude,
    startLongitude: data.startLongitude,
    googleMapsUrl,
    status: "ACTIVE",
    stops: ordered.map((candidate, index) => ({
      listPlaceId: candidate.id,
      stopOrder: index
    }))
  });

  await activityLogRepository.create({
    actorUserId: user.id,
    listId: data.listId,
    entityType: "ROUTE",
    entityId: routePlan.id,
    actionType: "route.generated",
    payloadJson: {
      stopCount: routePlan.stops.length,
      transportMode: data.transportMode,
      routeOrderingStrategy: data.routeOrderingStrategy
    }
  });

  return routePlan;
}
