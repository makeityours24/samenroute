import { completeRoutePlanService } from "@/server/services/routes/complete-route-plan.service";
import { completeRouteStopService } from "@/server/services/routes/complete-route-stop.service";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";

export async function POST(request: Request, context: { params: Promise<{ routePlanId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { routePlanId } = await context.params;
    const body = (await request.json()) as { routePlanStopId?: string; listPlaceId?: string };

    if (body.routePlanStopId && body.listPlaceId) {
      const data = await completeRouteStopService(user, {
        routePlanId,
        routePlanStopId: body.routePlanStopId,
        listPlaceId: body.listPlaceId
      });
      return ok(data);
    }

    const data = await completeRoutePlanService(routePlanId, user);
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
