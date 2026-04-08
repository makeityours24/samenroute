import { prisma } from "@/lib/db/prisma";
import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";
import { createPlaceService } from "@/server/services/places/create-place.service";

export async function GET() {
  try {
    await requireAuthenticatedUser();
    const data = await prisma.place.findMany({
      include: {
        category: true
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 50
    });
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const data = await createPlaceService(user, body);
    return ok(data, 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
