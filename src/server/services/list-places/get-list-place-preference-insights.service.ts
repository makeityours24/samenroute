import { ListPlacePreferenceRepository } from "@/server/repositories/list-place-preference.repository";

const listPlacePreferenceRepository = new ListPlacePreferenceRepository();

export async function getListPlacePreferenceInsightsService(input: {
  listId: string;
  listPlaceIds: string[];
}) {
  return listPlacePreferenceRepository.listGroupInsights(input);
}
