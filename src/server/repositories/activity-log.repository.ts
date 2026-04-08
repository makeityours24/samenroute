import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export class ActivityLogRepository {
  async create(input: {
    actorUserId: string;
    listId?: string;
    entityType: "LIST" | "PLACE" | "ROUTE" | "MEMBERSHIP";
    entityId: string;
    actionType: string;
    payloadJson?: Prisma.InputJsonValue;
  }) {
    return prisma.activityLog.create({
      data: input
    });
  }

  async listHistory(userId: string) {
    return prisma.activityLog.findMany({
      where: {
        list: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }]
        }
      },
      include: {
        list: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }
}
