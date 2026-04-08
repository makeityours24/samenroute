import { createListSchema } from "@/lib/validations/list";
import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListRepository } from "@/server/repositories/list.repository";

const listRepository = new ListRepository();
const activityLogRepository = new ActivityLogRepository();

export async function createListService(user: AuthorizedUser, input: unknown) {
  const data = createListSchema.parse(input);
  const list = await listRepository.create({
    ownerUserId: user.id,
    name: data.name,
    description: data.description,
    coverColor: data.coverColor
  });

  await activityLogRepository.create({
    actorUserId: user.id,
    listId: list.id,
    entityType: "LIST",
    entityId: list.id,
    actionType: "list.created",
    payloadJson: { name: list.name }
  });

  return list;
}
