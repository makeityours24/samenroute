import { updatePlaceService } from "@/server/services/places/update-place.service";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";

export async function PATCH(request: Request, context: { params: Promise<{ placeId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { placeId } = await context.params;
    const body = await request.json();
    const data = await updatePlaceService(placeId, user, body);
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
