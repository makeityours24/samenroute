import { prisma } from "@/lib/db/prisma";

export class RoutePlanRepository {
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
      include: {
        stops: {
          include: {
            listPlace: {
              include: {
                place: true
              }
            }
          },
          orderBy: { stopOrder: "asc" }
        },
        list: true
      }
    });
  }

  async findActiveByList(listId: string) {
    return prisma.routePlan.findFirst({
      where: {
        listId,
        status: "ACTIVE"
      },
      include: {
        stops: {
          include: {
            listPlace: {
              include: {
                place: true
              }
            }
          },
          orderBy: {
            stopOrder: "asc"
          }
        }
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
      include: {
        list: true,
        stops: {
          include: {
            listPlace: {
              include: {
                place: true
              }
            }
          },
          orderBy: { stopOrder: "asc" }
        }
      }
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
}
