import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";

const routePlanRepository = new RoutePlanRepository();

export async function GET(_: Request, context: { params: Promise<{ routePlanId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { routePlanId } = await context.params;
    const data = await routePlanRepository.findById(routePlanId, user.id);
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
