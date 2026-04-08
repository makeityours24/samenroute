import { ListMemberRole } from "@/server/domain/enums";
import type { MembershipContext } from "@/server/domain/types";

export function canReadList(userId: string, membership: MembershipContext): boolean {
  return membership.ownerUserId === userId || membership.membershipRole !== undefined;
}

export function canMutateList(userId: string, membership: MembershipContext): boolean {
  if (membership.ownerUserId === userId) {
    return true;
  }

  return membership.membershipRole === ListMemberRole.EDITOR;
}

export function canManageMembers(userId: string, membership: MembershipContext): boolean {
  return membership.ownerUserId === userId;
}
