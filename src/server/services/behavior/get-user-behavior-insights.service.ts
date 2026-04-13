import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";

const listPlaceRepository = new ListPlaceRepository();
const routePlanRepository = new RoutePlanRepository();

type ListPlaceInput = {
  id: string;
  status: "PLANNED" | "VISITED" | "SKIPPED";
  priority: number;
  includeInRoute: boolean;
  isFavorite: boolean;
  createdAt: Date;
  place: {
    category?: {
      name: string;
    } | null;
  };
};

export type UserBehaviorInsights = {
  topCategories: string[];
  favoriteCount: number;
  visitedCount: number;
  recommendedDayStopCount: number;
  recommendedTransportMode: "WALKING" | "BICYCLING" | "DRIVING" | "TRANSIT";
  recommendedListPlaceIds: string[];
};

function getCategoryWeight(input: {
  isFavorite: boolean;
  visitedByUserId?: string | null;
  status: "PLANNED" | "VISITED" | "SKIPPED";
  includeInRoute: boolean;
  userId: string;
}) {
  return (
    (input.isFavorite ? 4 : 0) +
    (input.visitedByUserId === input.userId ? 3 : 0) +
    (input.status === "VISITED" ? 2 : 0) +
    (input.includeInRoute ? 1 : 0)
  );
}

function getDaysSince(value: Date) {
  return Math.max(0, Math.floor((Date.now() - value.getTime()) / 86_400_000));
}

function getRecommendedDayStopCount(stopCounts: number[]) {
  if (stopCounts.length === 0) {
    return 3;
  }

  const normalized = stopCounts
    .filter((count) => count > 0)
    .map((count) => Math.min(Math.max(Math.round(count), 1), 8));

  if (normalized.length === 0) {
    return 3;
  }

  const average = normalized.reduce((sum, count) => sum + count, 0) / normalized.length;

  return Math.min(Math.max(Math.round(average), 2), 6);
}

function getRecommendedTransportMode(modes: Array<"WALKING" | "BICYCLING" | "DRIVING" | "TRANSIT">) {
  if (modes.length === 0) {
    return "WALKING" as const;
  }

  const scores = new Map<"WALKING" | "BICYCLING" | "DRIVING" | "TRANSIT", number>();

  modes.forEach((mode, index) => {
    const recencyWeight = Math.max(1, modes.length - index);
    scores.set(mode, (scores.get(mode) ?? 0) + recencyWeight);
  });

  return [...scores.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "WALKING";
}

export async function getUserBehaviorInsightsService(userId: string, currentListPlaces?: ListPlaceInput[]): Promise<UserBehaviorInsights> {
  const [signals, recentStopCounts, recentTransportModes] = await Promise.all([
    listPlaceRepository.getUserPreferenceSignals(userId),
    routePlanRepository.listRecentStopCountsByUser(userId),
    routePlanRepository.listRecentTransportModesByUser(userId)
  ]);
  const categoryScores = new Map<string, number>();
  let favoriteCount = 0;
  let visitedCount = 0;
  const recommendedDayStopCount = getRecommendedDayStopCount(recentStopCounts);
  const recommendedTransportMode = getRecommendedTransportMode(recentTransportModes);

  for (const item of signals) {
    if (item.isFavorite) {
      favoriteCount += 1;
    }

    if (item.status === "VISITED") {
      visitedCount += 1;
    }

    const categoryName = item.place.category?.name;

    if (!categoryName) {
      continue;
    }

    categoryScores.set(
      categoryName,
      (categoryScores.get(categoryName) ?? 0) +
        getCategoryWeight({
          isFavorite: item.isFavorite,
          visitedByUserId: item.visitedByUserId,
          status: item.status,
          includeInRoute: item.includeInRoute,
          userId
        })
    );
  }

  const topCategories = [...categoryScores.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([categoryName]) => categoryName);

  const recommendedListPlaceIds =
    currentListPlaces
      ?.filter((item) => item.status === "PLANNED")
      .map((item) => {
        const categoryScore = item.place.category?.name ? (categoryScores.get(item.place.category.name) ?? 0) : 0;
        const ageBonus = Math.min(getDaysSince(item.createdAt), 28) / 7;

        return {
          id: item.id,
          score: categoryScore + (item.isFavorite ? 6 : 0) + (item.includeInRoute ? 3 : 0) + item.priority * 2 + ageBonus
        };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, recommendedDayStopCount)
      .map((item) => item.id) ?? [];

  return {
    topCategories,
    favoriteCount,
    visitedCount,
    recommendedDayStopCount,
    recommendedTransportMode,
    recommendedListPlaceIds
  };
}
