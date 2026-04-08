import { addPlaceToListService } from "@/server/services/list-places/add-place-to-list.service";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const data = await addPlaceToListService(user, body);
    return ok(data, 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
