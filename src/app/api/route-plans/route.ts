import { generateRoutePlanService } from "@/server/services/routes/generate-route-plan.service";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const data = await generateRoutePlanService(user, body);
    return ok(data, 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
