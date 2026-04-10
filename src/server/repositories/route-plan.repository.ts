import { prisma } from "@/lib/db/prisma";

export class RoutePlanRepository {
  private routePlanInclude = {
    list: true,
    stops: {
      include: {
        listPlace: {
          include: {
            place: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { stopOrder: "asc" as const }
    }
  };

  async create(input: {
    listId: string;
    createdByUserId: string;
    title: string;
    transportMode: "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";
    startPlaceLabel?: string | null;
    startLatitude?: number | null;
    startLongitude?: number | null;
    googleMapsUrl?: string | null;
    status: "DRAFT" | "ACTIVE";
    stops: Array<{ listPlaceId: string; stopOrder: number }>;
  }) {
    return prisma.routePlan.create({
      data: {
        listId: input.listId,
        createdByUserId: input.createdByUserId,
        title: input.title,
        transportMode: input.transportMode,
        startPlaceLabel: input.startPlaceLabel,
        startLatitude: input.startLatitude,
        startLongitude: input.startLongitude,
        googleMapsUrl: input.googleMapsUrl,
        status: input.status,
        stops: {
          create: input.stops
        }
      },
      include: this.routePlanInclude
    });
  }

  async findActiveByList(listId: string) {
    return prisma.routePlan.findFirst({
      where: {
        listId,
        status: "ACTIVE"
      },
      include: {
        stops: this.routePlanInclude.stops
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async findById(routePlanId: string, userId: string) {
    return prisma.routePlan.findFirst({
      where: {
        id: routePlanId,
        list: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }]
        }
      },
      include: this.routePlanInclude
    });
  }

  async appendStop(routePlanId: string, input: { listPlaceId: string; googleMapsUrl?: string | null }) {
    const lastStop = await prisma.routePlanStop.findFirst({
      where: { routePlanId },
      orderBy: { stopOrder: "desc" },
      select: { stopOrder: true }
    });

    return prisma.routePlan.update({
      where: { id: routePlanId },
      data: {
        googleMapsUrl: input.googleMapsUrl,
        stops: {
          create: {
            listPlaceId: input.listPlaceId,
            stopOrder: (lastStop?.stopOrder ?? -1) + 1
          }
        }
      },
      include: this.routePlanInclude
    });
  }

  async completeStop(routePlanStopId: string) {
    return prisma.routePlanStop.update({
      where: { id: routePlanStopId },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });
  }

  async completePlan(routePlanId: string) {
    return prisma.routePlan.update({
      where: { id: routePlanId },
      data: { status: "COMPLETED" }
    });
  }

  async listRecentStopCountsByUser(userId: string, take = 8) {
    const plans = await prisma.routePlan.findMany({
      where: {
        createdByUserId: userId,
        status: {
          in: ["ACTIVE", "COMPLETED"]
        }
      },
      select: {
        _count: {
          select: {
            stops: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take
    });

    return plans
      .map((plan) => plan._count.stops)
      .filter((count) => Number.isFinite(count) && count > 0);
  }
}
