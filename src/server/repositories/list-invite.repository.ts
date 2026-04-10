import { prisma } from "@/lib/db/prisma";

export class ListInviteRepository {
  async upsertPendingInvite(input: {
    listId: string;
    email: string;
    role: "EDITOR" | "VIEWER";
    invitedByUserId: string;
  }) {
    return prisma.listInvite.upsert({
      where: {
        listId_email: {
          listId: input.listId,
          email: input.email
        }
      },
      update: {
        role: input.role,
        invitedByUserId: input.invitedByUserId,
        acceptedAt: null
      },
      create: input
    });
  }

  async findPendingByEmail(email: string) {
    return prisma.listInvite.findMany({
      where: {
        email,
        acceptedAt: null
      },
      include: {
        list: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  async markAcceptedByListAndEmail(input: { listId: string; email: string }) {
    await prisma.listInvite.updateMany({
      where: {
        listId: input.listId,
        email: input.email,
        acceptedAt: null
      },
      data: {
        acceptedAt: new Date()
      }
    });
  }

  async markAccepted(inviteIds: string[]) {
    if (inviteIds.length === 0) {
      return;
    }

    await prisma.listInvite.updateMany({
      where: {
        id: {
          in: inviteIds
        }
      },
      data: {
        acceptedAt: new Date()
      }
    });
  }
}
