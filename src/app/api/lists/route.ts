import { ListRepository } from "@/server/repositories/list.repository";
import { createListService } from "@/server/services/lists/create-list.service";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser, guardSensitiveRequest } from "@/lib/utils/request";

const listRepository = new ListRepository();

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const data = await listRepository.findAccessibleByUser(user.id);
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await guardSensitiveRequest("lists.create");
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const data = await createListService(user, body);
    return ok(data, 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
