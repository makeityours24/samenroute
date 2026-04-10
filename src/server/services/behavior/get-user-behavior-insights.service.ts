import { ListPlaceRepository } from "@/server/repositories/list-place.repository";

const listPlaceRepository = new ListPlaceRepository();

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

export async function getUserBehaviorInsightsService(userId: string, currentListPlaces?: ListPlaceInput[]): Promise<UserBehaviorInsights> {
  const signals = await listPlaceRepository.getUserPreferenceSignals(userId);
  const categoryScores = new Map<string, number>();
  let favoriteCount = 0;
  let visitedCount = 0;

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
      .slice(0, 3)
      .map((item) => item.id) ?? [];

  return {
    topCategories,
    favoriteCount,
    visitedCount,
    recommendedListPlaceIds
  };
}
