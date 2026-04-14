import type { TransportMode } from "@/server/domain/enums";
import { orderRouteCandidates } from "@/server/services/routes/generate-route-plan.service";

type ListPlaceInput = {
  id: string;
  priority: number;
  sortOrder: number;
  place: {
    name: string;
    latitude: unknown;
    longitude: unknown;
    categoryName?: string | null;
  };
};

export type SuggestedDayPlan = {
  dayNumber: number;
  title: string;
  dayType: "CALM" | "BALANCED" | "HIGHLIGHTS";
  dayTheme: "CULTURE" | "FOOD_WALK" | "OUTDOOR" | "MIX";
  dayMoment: "MORNING" | "LUNCH" | "AFTERNOON" | "EVENING";
  stopIds: string[];
  stopNames: string[];
};

function getDayType(input: { chunkSize: number; averagePriority: number; totalChunkSize: number; index: number }) {
  if (input.chunkSize <= 2) {
    return "CALM" as const;
  }

  if (input.averagePriority >= 2 || (input.index === 0 && input.totalChunkSize >= 4)) {
    return "HIGHLIGHTS" as const;
  }

  return "BALANCED" as const;
}

function getCategoryBucket(categoryName?: string | null) {
  const normalized = categoryName?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return "MIX" as const;
  }

  if (
    normalized.includes("museum") ||
    normalized.includes("cult") ||
    normalized.includes("kerk") ||
    normalized.includes("galer") ||
    normalized.includes("monument")
  ) {
    return "CULTURE" as const;
  }

  if (
    normalized.includes("restaurant") ||
    normalized.includes("eten") ||
    normalized.includes("koffie") ||
    normalized.includes("cafe") ||
    normalized.includes("café") ||
    normalized.includes("bakery") ||
    normalized.includes("lunch")
  ) {
    return "FOOD_WALK" as const;
  }

  if (
    normalized.includes("park") ||
    normalized.includes("plas") ||
    normalized.includes("natuur") ||
    normalized.includes("wand") ||
    normalized.includes("uitzicht")
  ) {
    return "OUTDOOR" as const;
  }

  return "MIX" as const;
}

function getDayTheme(chunk: ListPlaceInput[]) {
  const scores = new Map<"CULTURE" | "FOOD_WALK" | "OUTDOOR" | "MIX", number>();

  for (const item of chunk) {
    const bucket = getCategoryBucket(item.place.categoryName);
    scores.set(bucket, (scores.get(bucket) ?? 0) + 1);
  }

  return [...scores.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "MIX";
}

function getDayMoment(input: {
  dayType: SuggestedDayPlan["dayType"];
  dayTheme: SuggestedDayPlan["dayTheme"];
  index: number;
}) {
  if (input.dayTheme === "FOOD_WALK") {
    return "LUNCH" as const;
  }

  if (input.index === 0 && input.dayType === "CALM") {
    return "MORNING" as const;
  }

  if (input.dayType === "HIGHLIGHTS") {
    return "AFTERNOON" as const;
  }

  if (input.index >= 2) {
    return "EVENING" as const;
  }

  return "AFTERNOON" as const;
}

export function suggestDayPlans(input: {
  candidates: ListPlaceInput[];
  stopsPerDay: number;
  transportMode: TransportMode;
}) {
  if (input.candidates.length === 0) {
    return [];
  }

  const stopsPerDay = Math.max(2, input.stopsPerDay);
  const ordered = orderRouteCandidates({
    transportMode: input.transportMode,
    routeOrderingStrategy: "FASTEST",
    candidates: input.candidates,
    maxStops: input.candidates.length
  });

  const plans: SuggestedDayPlan[] = [];

  for (let index = 0; index < ordered.length; index += stopsPerDay) {
    const chunk = ordered.slice(index, index + stopsPerDay);
    const averagePriority = chunk.reduce((sum, item) => sum + item.priority, 0) / chunk.length;
    const dayNumber = plans.length + 1;
    const dayType = getDayType({
      chunkSize: chunk.length,
      averagePriority,
      totalChunkSize: ordered.length,
      index: plans.length
    });
    const dayTheme = getDayTheme(chunk);

    plans.push({
      dayNumber,
      title: `Dag ${dayNumber}`,
      dayType,
      dayTheme,
      dayMoment: getDayMoment({ dayType, dayTheme, index: plans.length }),
      stopIds: chunk.map((item) => item.id),
      stopNames: chunk.map((item) => item.place.name)
    });
  }

  return plans;
}
