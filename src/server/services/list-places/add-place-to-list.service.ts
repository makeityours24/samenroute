import { Prisma } from "@prisma/client";
import { addPlaceToListSchema } from "@/lib/validations/list-place";
import type { AuthorizedUser } from "@/server/domain/types";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { ConflictError } from "@/server/services/errors";
import { requireMutableList } from "@/server/services/shared";

const listPlaceRepository = new ListPlaceRepository();
const activityLogRepository = new ActivityLogRepository();

export async function addPlaceToListService(user: AuthorizedUser, input: unknown) {
  const data = addPlaceToListSchema.parse(input);
  await requireMutableList(data.listId, user);

  try {
    const listPlace = await listPlaceRepository.add(data);

    await activityLogRepository.create({
      actorUserId: user.id,
      listId: data.listId,
      entityType: "PLACE",
      entityId: listPlace.id,
      actionType: "list.place_added",
      payloadJson: {
        placeId: data.placeId
      }
    });

    return listPlace;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError("That place is already linked to this list.");
    }

    throw error;
  }
}
