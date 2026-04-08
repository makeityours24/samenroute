import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import type { AuthorizedUser } from "@/server/domain/types";

const activityLogRepository = new ActivityLogRepository();

export async function getHistoryService(user: AuthorizedUser) {
  return activityLogRepository.listHistory(user.id);
}
