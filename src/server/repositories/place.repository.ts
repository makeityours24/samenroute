import { prisma } from "@/lib/db/prisma";

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

  async listCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" }
    });
  }
}
