import { inviteMemberSchema } from "@/lib/validations/list";
import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListMemberRepository } from "@/server/repositories/list-member.repository";
import { prisma } from "@/lib/db/prisma";
import { requireMemberManager } from "@/server/services/shared";
import { ConflictError, NotFoundError } from "@/server/services/errors";

const listMemberRepository = new ListMemberRepository();
const activityLogRepository = new ActivityLogRepository();

export async function shareListService(listId: string, user: AuthorizedUser, input: unknown) {
  await requireMemberManager(listId, user);
  const data = inviteMemberSchema.parse(input);

  const invitee = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!invitee) {
    throw new NotFoundError("No user with that email exists yet.");
  }

  const existing = await prisma.listMember.findUnique({
    where: {
      listId_userId: {
        listId,
        userId: invitee.id
      }
    }
  });

  if (existing) {
    throw new ConflictError("That person is already on the list.");
  }

  const membership = await listMemberRepository.addMember({
    listId,
    userId: invitee.id,
    role: data.role
  });

  await activityLogRepository.create({
    actorUserId: user.id,
    listId,
    entityType: "MEMBERSHIP",
    entityId: membership.id,
    actionType: "list.member_invited",
    payloadJson: {
      invitedUserId: invitee.id,
      role: data.role
    }
  });

  return membership;
}
