import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";
import { NotFoundError } from "@/server/services/errors";

const routePlanRepository = new RoutePlanRepository();
const activityLogRepository = new ActivityLogRepository();

export async function completeRoutePlanService(routePlanId: string, user: AuthorizedUser) {
  const routePlan = await routePlanRepository.findById(routePlanId, user.id);

  if (!routePlan) {
    throw new NotFoundError("Route plan not found.");
  }

  const completed = await routePlanRepository.completePlan(routePlanId);
  await activityLogRepository.create({
    actorUserId: user.id,
    listId: routePlan.listId,
    entityType: "ROUTE",
    entityId: routePlanId,
    actionType: "route.completed"
  });

  return completed;
}
