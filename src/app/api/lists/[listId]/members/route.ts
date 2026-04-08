import { shareListService } from "@/server/services/lists/share-list.service";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser, guardSensitiveRequest } from "@/lib/utils/request";

export async function POST(request: Request, context: { params: Promise<{ listId: string }> }) {
  try {
    await guardSensitiveRequest("lists.share");
    const user = await requireAuthenticatedUser();
    const { listId } = await context.params;
    const body = await request.json();
    const data = await shareListService(listId, user, body);
    return ok(data, 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
