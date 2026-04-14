import { ListPlacePreferenceRepository } from "@/server/repositories/list-place-preference.repository";

const listPlacePreferenceRepository = new ListPlacePreferenceRepository();

export async function getUserListPlacePreferencesService(input: {
  userId: string;
  listId: string;
  listPlaceIds: string[];
}) {
  return listPlacePreferenceRepository.listLatestForUser(input);
}
