import { updateListPlaceSchema } from "@/lib/validations/list-place";
import type { AuthorizedUser } from "@/server/domain/types";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { requireMutableList } from "@/server/services/shared";
import { NotFoundError } from "@/server/services/errors";

const listPlaceRepository = new ListPlaceRepository();

export async function updateListPlaceService(listPlaceId: string, user: AuthorizedUser, input: unknown) {
  const listPlace = await listPlaceRepository.findById(listPlaceId);

  if (!listPlace) {
    throw new NotFoundError("List place not found.");
  }

  await requireMutableList(listPlace.listId, user);
  const data = updateListPlaceSchema.parse(input);

  return listPlaceRepository.update(listPlaceId, data);
}
