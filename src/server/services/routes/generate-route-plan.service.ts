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
type RouteCandidate = {
  id: string;
  priority: number;
  sortOrder: number;
  place: { name: string; latitude: unknown; longitude: unknown };
};

function calculateDistance(
  origin: { latitude: number; longitude: number },
  target: { latitude: number; longitude: number }
) {
  return Math.sqrt((origin.latitude - target.latitude) ** 2 + (origin.longitude - target.longitude) ** 2);
}

function getCoordinates(place: RouteCandidate["place"]) {
  if (place.latitude == null || place.longitude == null || place.latitude === "" || place.longitude === "") {
    return null;
  }

  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function sortFallbackCandidates(candidates: RouteCandidate[]) {
  return [...candidates].sort((left, right) => left.sortOrder - right.sortOrder || right.priority - left.priority);
}

function buildOptimalPath(input: {
  candidates: RouteCandidate[];
  start?: { latitude: number; longitude: number };
}) {
  const coordinates = input.candidates.map((candidate) => getCoordinates(candidate.place));

  if (coordinates.some((value) => !value)) {
    return {
      ordered: sortFallbackCandidates(input.candidates),
      totalDistance: Number.POSITIVE_INFINITY
    };
  }

  const points = coordinates as Array<{ latitude: number; longitude: number }>;
  const candidateCount = input.candidates.length;
  const subsetCount = 1 << candidateCount;
  const dp = Array.from({ length: subsetCount }, () => Array<number>(candidateCount).fill(Number.POSITIVE_INFINITY));
  const previous = Array.from({ length: subsetCount }, () => Array<number>(candidateCount).fill(-1));

  for (let index = 0; index < candidateCount; index += 1) {
    dp[1 << index][index] = input.start ? calculateDistance(input.start, points[index]) : 0;
  }

  for (let mask = 1; mask < subsetCount; mask += 1) {
    for (let endIndex = 0; endIndex < candidateCount; endIndex += 1) {
      if ((mask & (1 << endIndex)) === 0) {
        continue;
      }

      const currentCost = dp[mask][endIndex];

      if (!Number.isFinite(currentCost)) {
        continue;
      }

      for (let nextIndex = 0; nextIndex < candidateCount; nextIndex += 1) {
        if (mask & (1 << nextIndex)) {
          continue;
        }

        const nextMask = mask | (1 << nextIndex);
        const nextCost = currentCost + calculateDistance(points[endIndex], points[nextIndex]);

        if (nextCost < dp[nextMask][nextIndex]) {
          dp[nextMask][nextIndex] = nextCost;
          previous[nextMask][nextIndex] = endIndex;
          continue;
        }

        if (nextCost === dp[nextMask][nextIndex]) {
          const currentCandidate = input.candidates[nextIndex];
          const previousCandidate = input.candidates[previous[nextMask][nextIndex] === -1 ? nextIndex : previous[nextMask][nextIndex]];

          if (
            currentCandidate.priority > previousCandidate.priority ||
            (currentCandidate.priority === previousCandidate.priority && currentCandidate.sortOrder < previousCandidate.sortOrder)
          ) {
            previous[nextMask][nextIndex] = endIndex;
          }
        }
      }
    }
  }

  const fullMask = subsetCount - 1;
  let bestEndIndex = 0;

  for (let index = 1; index < candidateCount; index += 1) {
    const leftCost = dp[fullMask][index];
    const rightCost = dp[fullMask][bestEndIndex];
    const leftCandidate = input.candidates[index];
    const rightCandidate = input.candidates[bestEndIndex];

    if (
      leftCost < rightCost ||
      (leftCost === rightCost &&
        (leftCandidate.priority > rightCandidate.priority ||
          (leftCandidate.priority === rightCandidate.priority && leftCandidate.sortOrder < rightCandidate.sortOrder)))
    ) {
      bestEndIndex = index;
    }
  }

  const orderedIndices: number[] = [];
  let mask = fullMask;
  let currentIndex = bestEndIndex;

  while (currentIndex !== -1) {
    orderedIndices.push(currentIndex);
    const previousIndex = previous[mask][currentIndex];
    mask ^= 1 << currentIndex;
    currentIndex = previousIndex;
  }

  orderedIndices.reverse();

  return {
    ordered: orderedIndices.map((index) => input.candidates[index]),
    totalDistance: dp[fullMask][bestEndIndex]
  };
}

function orderFastestCandidates(input: {
  candidates: RouteCandidate[];
  maxStops: number;
  start?: { latitude?: number; longitude?: number };
}) {
  const withCoordinates = input.candidates.filter((candidate) => getCoordinates(candidate.place));
  const withoutCoordinates = input.candidates.filter((candidate) => !getCoordinates(candidate.place));
  const fallbackTail = sortFallbackCandidates(withoutCoordinates);

  if (withCoordinates.length === 0) {
    return sortFallbackCandidates(input.candidates).slice(0, input.maxStops);
  }

  const path = buildOptimalPath({
    candidates: withCoordinates,
    start:
      typeof input.start?.latitude === "number" && typeof input.start.longitude === "number"
        ? {
            latitude: input.start.latitude,
            longitude: input.start.longitude
          }
        : undefined
  });

  if (!path.ordered.length) {
    return sortFallbackCandidates(input.candidates).slice(0, input.maxStops);
  }

  return [...path.ordered, ...fallbackTail].slice(0, input.maxStops);
}

export function orderRouteCandidates(input: {
  transportMode: TransportMode;
  routeOrderingStrategy: RouteOrderingStrategy;
  candidates: RouteCandidate[];
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

  return orderFastestCandidates({
    candidates,
    maxStops: input.maxStops,
    start: input.start
  });
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
