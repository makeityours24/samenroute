import { sendEmailMagicLink } from "@/lib/auth/auth";
import { inviteMemberSchema } from "@/lib/validations/list";
import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListInviteRepository } from "@/server/repositories/list-invite.repository";
import { ListMemberRepository } from "@/server/repositories/list-member.repository";
import { prisma } from "@/lib/db/prisma";
import { requireMemberManager } from "@/server/services/shared";
import { ConflictError } from "@/server/services/errors";

const listMemberRepository = new ListMemberRepository();
const listInviteRepository = new ListInviteRepository();
const activityLogRepository = new ActivityLogRepository();

export async function shareListService(listId: string, user: AuthorizedUser, input: unknown) {
  await requireMemberManager(listId, user);
  const data = inviteMemberSchema.parse(input);
  const email = data.email.trim().toLowerCase();

  const invitee = await prisma.user.findUnique({
    where: { email }
  });

  if (invitee) {
    await listInviteRepository.markAcceptedByListAndEmail({
      listId,
      email
    });

    const existing = await prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId,
          userId: invitee.id
        }
      }
    });

    if (existing) {
      if (existing.role === data.role) {
        throw new ConflictError("That person already has access with this role.");
      }

      const membership = await listMemberRepository.updateRole(listId, invitee.id, data.role);

      return {
        kind: "member_role_updated" as const,
        membership,
        message: "Toegang bijgewerkt."
      };
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

    return {
      kind: "member_added" as const,
      membership,
      message: "Toegang gedeeld."
    };
  }

  const invite = await listInviteRepository.upsertPendingInvite({
    listId,
    email,
    role: data.role,
    invitedByUserId: user.id
  });
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { name: true }
  });

  await sendEmailMagicLink({
    email,
    callbackPath: `/lists/${listId}`,
    subject: `Uitnodiging voor ${list?.name ?? "een SamenRoute-lijst"}`,
    intro: `Je bent uitgenodigd voor "${list?.name ?? "een SamenRoute-lijst"}". Open de magic link om direct toegang te krijgen.`,
    reason: `Iemand heeft dit e-mailadres gebruikt om je toegang te geven tot "${list?.name ?? "een SamenRoute-lijst"}" op samenroute.nl.`,
    destinationHint: "Daarna kom je direct in de gedeelde lijst terecht."
  });

  await activityLogRepository.create({
    actorUserId: user.id,
    listId,
    entityType: "MEMBERSHIP",
    entityId: invite.id,
    actionType: "list.member_invited",
    payloadJson: {
      invitedEmail: email,
      role: data.role
    }
  });

  return {
    kind: "invite_sent" as const,
    invite,
    message: "Uitnodiging verstuurd. Deze persoon ontvangt een magic link."
  };
}
