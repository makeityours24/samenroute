import { createPlaceSchema } from "@/lib/validations/place";
import type { AuthorizedUser } from "@/server/domain/types";
import { PlaceRepository } from "@/server/repositories/place.repository";

const placeRepository = new PlaceRepository();

export async function createPlaceService(user: AuthorizedUser, input: unknown) {
  const data = createPlaceSchema.parse(input);

  return placeRepository.create({
    ...data,
    createdByUserId: user.id
  });
}
