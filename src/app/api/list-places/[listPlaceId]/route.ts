import { markListPlaceSkippedService } from "@/server/services/list-places/mark-list-place-skipped.service";
import { markListPlaceVisitedService } from "@/server/services/list-places/mark-list-place-visited.service";
import { updateListPlaceService } from "@/server/services/list-places/update-list-place.service";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";

export async function PATCH(request: Request, context: { params: Promise<{ listPlaceId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { listPlaceId } = await context.params;
    const body = await request.json();
    const data = await updateListPlaceService(listPlaceId, user, body);
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ listPlaceId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { listPlaceId } = await context.params;
    const body = (await request.json()) as { action: "visit" | "skip" };

    if (body.action === "visit") {
      const data = await markListPlaceVisitedService(user, { listPlaceId });
      return ok(data);
    }

    const data = await markListPlaceSkippedService(user, { listPlaceId });
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
