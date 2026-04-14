import { z } from "zod";
import type { AuthorizedUser } from "@/server/domain/types";
import { ListPlacePreferenceRepository, listPlacePreferenceValues } from "@/server/repositories/list-place-preference.repository";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { NotFoundError } from "@/server/services/errors";
import { requireReadableList } from "@/server/services/shared";

const listPlaceRepository = new ListPlaceRepository();
const listPlacePreferenceRepository = new ListPlacePreferenceRepository();

const saveListPlacePreferenceSchema = z.object({
  listId: z.string().uuid(),
  listPlaceId: z.string().uuid(),
  preference: z.enum(listPlacePreferenceValues)
});

export async function saveListPlacePreferenceService(user: AuthorizedUser, input: unknown) {
  const data = saveListPlacePreferenceSchema.parse(input);
  await requireReadableList(data.listId, user);

  const listPlace = await listPlaceRepository.findById(data.listPlaceId);

  if (!listPlace || listPlace.listId !== data.listId) {
    throw new NotFoundError("Place not found.");
  }

  await listPlacePreferenceRepository.save({
    actorUserId: user.id,
    listId: data.listId,
    listPlaceId: data.listPlaceId,
    preference: data.preference
  });
}
