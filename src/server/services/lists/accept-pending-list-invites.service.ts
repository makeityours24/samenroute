import { ListInviteRepository } from "@/server/repositories/list-invite.repository";
import { ListMemberRepository } from "@/server/repositories/list-member.repository";
import { prisma } from "@/lib/db/prisma";

const listInviteRepository = new ListInviteRepository();
const listMemberRepository = new ListMemberRepository();

export async function acceptPendingListInvitesService(input: { userId: string; email: string }) {
  const email = input.email.trim().toLowerCase();
  const invites = await listInviteRepository.findPendingByEmail(email);

  if (invites.length === 0) {
    return [];
  }

  for (const invite of invites) {
    const existingMember = await prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId: invite.listId,
          userId: input.userId
        }
      }
    });

    if (existingMember) {
      if (existingMember.role !== invite.role) {
        await listMemberRepository.updateRole(invite.listId, input.userId, invite.role);
      }

      continue;
    }

    await listMemberRepository.addMember({
      listId: invite.listId,
      userId: input.userId,
      role: invite.role
    });
  }

  await listInviteRepository.markAccepted(invites.map((invite) => invite.id));

  return invites.map((invite) => invite.listId);
}
