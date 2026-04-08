import { updateListSchema } from "@/lib/validations/list";
import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListRepository } from "@/server/repositories/list.repository";
import { requireMutableList } from "@/server/services/shared";

const listRepository = new ListRepository();
const activityLogRepository = new ActivityLogRepository();

export async function updateListService(listId: string, user: AuthorizedUser, input: unknown) {
  await requireMutableList(listId, user);
  const data = updateListSchema.parse(input);
  const list = await listRepository.update(listId, data);

  await activityLogRepository.create({
    actorUserId: user.id,
    listId,
    entityType: "LIST",
    entityId: listId,
    actionType: "list.updated",
    payloadJson: data
  });

  return list;
}
