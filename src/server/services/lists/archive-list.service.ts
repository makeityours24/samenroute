import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListRepository } from "@/server/repositories/list.repository";
import { requireMutableList } from "@/server/services/shared";

const listRepository = new ListRepository();
const activityLogRepository = new ActivityLogRepository();

export async function archiveListService(listId: string, user: AuthorizedUser) {
  await requireMutableList(listId, user);
  const list = await listRepository.archive(listId);

  await activityLogRepository.create({
    actorUserId: user.id,
    listId,
    entityType: "LIST",
    entityId: listId,
    actionType: "list.archived"
  });

  return list;
}
