import { markVisitedSchema } from "@/lib/validations/list-place";
import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { NotFoundError } from "@/server/services/errors";
import { requireMutableList } from "@/server/services/shared";

const listPlaceRepository = new ListPlaceRepository();
const activityLogRepository = new ActivityLogRepository();

export async function markListPlaceVisitedService(user: AuthorizedUser, input: unknown) {
  const data = markVisitedSchema.parse(input);
  const listPlace = await listPlaceRepository.findById(data.listPlaceId);

  if (!listPlace) {
    throw new NotFoundError("List place not found.");
  }

  await requireMutableList(listPlace.listId, user);
  const updated = await listPlaceRepository.markVisited(data.listPlaceId, user.id);

  await activityLogRepository.create({
    actorUserId: user.id,
    listId: listPlace.listId,
    entityType: "PLACE",
    entityId: data.listPlaceId,
    actionType: "list.place_visited",
    payloadJson: {
      visitedAt: updated.visitedAt?.toISOString()
    }
  });

  return updated;
}
