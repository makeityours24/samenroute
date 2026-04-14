import { prisma } from "@/lib/db/prisma";

export class DemoRequestRepository {
  async create(input: {
    name: string;
    officeName: string;
    email: string;
    city?: string;
    weeklyViewings?: string;
    notes?: string;
    createdByUserId?: string;
  }) {
    return prisma.demoRequest.create({
      data: {
        name: input.name,
        officeName: input.officeName,
        email: input.email,
        city: input.city,
        weeklyViewings: input.weeklyViewings,
        notes: input.notes,
        createdByUserId: input.createdByUserId
      }
    });
  }

  async listRecent(limit = 50) {
    return prisma.demoRequest.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      take: limit
    });
  }
}
