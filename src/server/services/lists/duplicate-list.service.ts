import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListRepository } from "@/server/repositories/list.repository";
import { requireReadableList } from "@/server/services/shared";

const listRepository = new ListRepository();
const activityLogRepository = new ActivityLogRepository();

export async function duplicateListService(listId: string, user: AuthorizedUser) {
  const sourceMembership = await requireReadableList(listId, user);
  const source = await listRepository.duplicate(listId, user.id, "Kopie");

  await activityLogRepository.create({
    actorUserId: user.id,
    listId: source.id,
    entityType: "LIST",
    entityId: source.id,
    actionType: "list.duplicated",
    payloadJson: {
      sourceListId: sourceMembership.listId
    }
  });

  return source;
}
