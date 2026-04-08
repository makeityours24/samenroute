import { prisma } from "@/lib/db/prisma";

export class ListMemberRepository {
  async addMember(input: { listId: string; userId: string; role: "OWNER" | "EDITOR" | "VIEWER" }) {
    return prisma.listMember.create({
      data: input
    });
  }

  async updateRole(listId: string, userId: string, role: "OWNER" | "EDITOR" | "VIEWER") {
    return prisma.listMember.update({
      where: {
        listId_userId: {
          listId,
          userId
        }
      },
      data: { role }
    });
  }

  async removeMember(listId: string, userId: string) {
    return prisma.listMember.delete({
      where: {
        listId_userId: {
          listId,
          userId
        }
      }
    });
  }
}
