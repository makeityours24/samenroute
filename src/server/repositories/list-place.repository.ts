import { prisma } from "@/lib/db/prisma";

export class ListPlaceRepository {
  async add(input: {
    listId: string;
    placeId: string;
    note?: string;
    priority?: number;
    includeInRoute?: boolean;
    isFavorite?: boolean;
  }) {
    const last = await prisma.listPlace.findFirst({
      where: { listId: input.listId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true }
    });

    return prisma.listPlace.create({
      data: {
        ...input,
        priority: input.priority ?? 0,
        includeInRoute: input.includeInRoute ?? true,
        isFavorite: input.isFavorite ?? false,
        sortOrder: (last?.sortOrder ?? -1) + 1
      }
    });
  }

  async update(
    listPlaceId: string,
    input: Partial<{
      note: string | null;
      priority: number;
      includeInRoute: boolean;
      isFavorite: boolean;
      status: "PLANNED" | "VISITED" | "SKIPPED";
    }>
  ) {
    return prisma.listPlace.update({
      where: { id: listPlaceId },
      data: input
    });
  }

  async findById(listPlaceId: string) {
    return prisma.listPlace.findUnique({
      where: { id: listPlaceId },
      include: {
        list: true,
        place: true
      }
    });
  }

  async markVisited(listPlaceId: string, userId: string) {
    return prisma.listPlace.update({
      where: { id: listPlaceId },
      data: {
        status: "VISITED",
        visitedAt: new Date(),
        visitedByUserId: userId
      },
      include: {
        place: true,
        list: true
      }
    });
  }

  async markSkipped(listPlaceId: string) {
    return prisma.listPlace.update({
      where: { id: listPlaceId },
      data: {
        status: "SKIPPED"
      },
      include: {
        place: true,
        list: true
      }
    });
  }

  async reorder(listId: string, orderedIds: string[]) {
    return prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.listPlace.updateMany({
          where: { id, listId },
          data: { sortOrder: index }
        })
      )
    );
  }

  async remove(listPlaceId: string) {
    return prisma.listPlace.delete({
      where: { id: listPlaceId }
    });
  }

  async getRouteCandidates(listId: string, listPlaceIds: string[]) {
    return prisma.listPlace.findMany({
      where: {
        listId,
        id: { in: listPlaceIds }
      },
      include: {
        place: true
      }
    });
  }
}
