import { updatePlaceSchema } from "@/lib/validations/place";
import type { AuthorizedUser } from "@/server/domain/types";
import { PlaceRepository } from "@/server/repositories/place.repository";
import { NotFoundError } from "@/server/services/errors";

const placeRepository = new PlaceRepository();

export async function updatePlaceService(placeId: string, _user: AuthorizedUser, input: unknown) {
  const place = await placeRepository.findById(placeId);

  if (!place) {
    throw new NotFoundError("Place not found.");
  }

  const data = updatePlaceSchema.parse(input);
  return placeRepository.update(placeId, data);
}
