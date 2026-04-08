import { archiveListService } from "@/server/services/lists/archive-list.service";
import { updateListService } from "@/server/services/lists/update-list.service";
import { ListRepository } from "@/server/repositories/list.repository";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";

const listRepository = new ListRepository();

export async function GET(_: Request, context: { params: Promise<{ listId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { listId } = await context.params;
    const data = await listRepository.findDetail(listId, user.id);
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ listId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { listId } = await context.params;
    const body = await request.json();
    const data = await updateListService(listId, user, body);
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ listId: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { listId } = await context.params;
    const data = await archiveListService(listId, user);
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
