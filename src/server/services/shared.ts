import { canManageMembers, canMutateList, canReadList } from "@/server/domain/policies/list-policy";
import type { AuthorizedUser } from "@/server/domain/types";
import { ListRepository } from "@/server/repositories/list.repository";
import { AuthorizationError, NotFoundError } from "@/server/services/errors";

const listRepository = new ListRepository();

export async function requireReadableList(listId: string, user: AuthorizedUser) {
  const membership = await listRepository.getMembershipContext(listId, user.id);

  if (!membership) {
    throw new NotFoundError("List not found.");
  }

  if (!canReadList(user.id, membership)) {
    throw new AuthorizationError();
  }

  return membership;
}

export async function requireMutableList(listId: string, user: AuthorizedUser) {
  const membership = await requireReadableList(listId, user);

  if (!canMutateList(user.id, membership)) {
    throw new AuthorizationError();
  }

  return membership;
}

export async function requireMemberManager(listId: string, user: AuthorizedUser) {
  const membership = await requireReadableList(listId, user);

  if (!canManageMembers(user.id, membership)) {
    throw new AuthorizationError("Only the list owner can manage members.");
  }

  return membership;
}
