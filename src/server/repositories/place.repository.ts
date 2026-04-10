import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

const DEFAULT_CATEGORIES = [
  { id: "00000000-0000-4000-8000-000000000001", name: "Coffee", iconName: "coffee" },
  { id: "00000000-0000-4000-8000-000000000002", name: "Food", iconName: "utensils" },
  { id: "00000000-0000-4000-8000-000000000003", name: "Museum", iconName: "landmark" },
  { id: "00000000-0000-4000-8000-000000000004", name: "Park", iconName: "trees" }
] as const;

export class PlaceRepository {
  async create(input: {
    sourceType: "MANUAL" | "GOOGLE_PLACE" | "IMPORTED";
    externalSourceId?: string | null;
    name: string;
    addressLine?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    googleMapsUrl?: string | null;
    categoryId?: string | null;
    createdByUserId: string;
  }) {
    return prisma.place.create({
      data: input
    });
  }

  async update(placeId: string, input: {
    name?: string;
    addressLine?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    googleMapsUrl?: string | null;
    categoryId?: string | null;
  }) {
    return prisma.place.update({
      where: { id: placeId },
      data: input
    });
  }

  async findById(placeId: string) {
    return prisma.place.findUnique({
      where: { id: placeId },
      include: {
        category: true
      }
    });
  }

  async findByExternalSourceId(externalSourceId: string) {
    return prisma.place.findFirst({
      where: { externalSourceId },
      include: {
        category: true
      }
    });
  }

  async findSuggestions(input: {
    excludePlaceIds?: string[];
    city?: string | null;
    country?: string | null;
    categoryNames?: string[];
    limit?: number;
  }) {
    const orFilters: Prisma.PlaceWhereInput[] = [];

    if (input.city) {
      orFilters.push({
        city: {
          equals: input.city,
          mode: "insensitive"
        }
      });
    }

    if (input.country) {
      orFilters.push({
        country: {
          equals: input.country,
          mode: "insensitive"
        }
      });
    }

    if (input.categoryNames && input.categoryNames.length > 0) {
      orFilters.push({
        category: {
          name: {
            in: input.categoryNames
          }
        }
      });
    }

    return prisma.place.findMany({
      where: {
        id: {
          notIn: input.excludePlaceIds ?? []
        },
        OR: orFilters
      },
      include: {
        category: true
      },
      take: input.limit ?? 10,
      orderBy: [{ city: "asc" }, { name: "asc" }]
    });
  }

  async listCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });

    if (categories.length > 0) {
      return categories;
    }

    await prisma.$transaction(
      DEFAULT_CATEGORIES.map((category) =>
        prisma.category.upsert({
          where: { name: category.name },
          update: { iconName: category.iconName },
          create: {
            id: category.id,
            name: category.name,
            iconName: category.iconName
          }
        })
      )
    );

    return prisma.category.findMany({
      orderBy: { name: "asc" }
    });
  }
}
