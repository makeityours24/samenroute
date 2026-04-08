import { completeRouteStopSchema } from "@/lib/validations/route-plan";
import type { AuthorizedUser } from "@/server/domain/types";
import { markListPlaceVisitedService } from "@/server/services/list-places/mark-list-place-visited.service";
import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";
import { NotFoundError } from "@/server/services/errors";

const routePlanRepository = new RoutePlanRepository();

export async function completeRouteStopService(user: AuthorizedUser, input: unknown) {
  const data = completeRouteStopSchema.parse(input);
  const routePlan = await routePlanRepository.findById(data.routePlanId, user.id);

  if (!routePlan) {
    throw new NotFoundError("Route plan not found.");
  }

  const stop = routePlan.stops.find((routeStop) => routeStop.id === data.routePlanStopId);

  if (!stop) {
    throw new NotFoundError("Route stop not found.");
  }

  await routePlanRepository.completeStop(data.routePlanStopId);
  await markListPlaceVisitedService(user, { listPlaceId: data.listPlaceId });

  return routePlanRepository.findById(data.routePlanId, user.id);
}
