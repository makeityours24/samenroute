import type { AuthorizedUser } from "@/server/domain/types";
import { ListRepository } from "@/server/repositories/list.repository";
import { AppError, NotFoundError } from "@/server/services/errors";
import { requireMemberManager } from "@/server/services/shared";

const listRepository = new ListRepository();

export async function deleteArchivedListService(listId: string, user: AuthorizedUser) {
  await requireMemberManager(listId, user);

  const list = await listRepository.findDetail(listId, user.id);

  if (!list) {
    throw new NotFoundError("List not found.");
  }

  if (!list.isArchived) {
    throw new AppError("Alleen gearchiveerde lijsten kunnen definitief worden verwijderd.");
  }

  await listRepository.remove(listId);
}
