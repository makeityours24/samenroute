import type { AuthorizedUser } from "@/server/domain/types";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { requireMutableList } from "@/server/services/shared";

const listPlaceRepository = new ListPlaceRepository();

export async function reorderListPlacesService(listId: string, user: AuthorizedUser, orderedIds: string[]) {
  await requireMutableList(listId, user);
  return listPlaceRepository.reorder(listId, orderedIds);
}
