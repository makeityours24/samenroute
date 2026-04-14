import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";

const actionType = "list.day_plan_confirmed";
const activityLogRepository = new ActivityLogRepository();

export class ListDayPlanSelectionRepository {
  async confirm(input: {
    actorUserId: string;
    listId: string;
    dayNumber: number;
    dayTitle: string;
    stopIds: string[];
  }) {
    return activityLogRepository.create({
      actorUserId: input.actorUserId,
      listId: input.listId,
      entityType: "LIST",
      entityId: input.listId,
      actionType,
      payloadJson: {
        dayNumber: input.dayNumber,
        dayTitle: input.dayTitle,
        stopIds: input.stopIds
      }
    });
  }

  async findLatest(listId: string) {
    const log = await activityLogRepository.findLatestByAction({
      listId,
      actionType
    });

    if (!log) {
      return null;
    }

    const payload = (log.payloadJson as {
      dayNumber?: unknown;
      dayTitle?: unknown;
      stopIds?: unknown;
    } | null) ?? { };

    return {
      actorUserId: log.actorUserId,
      dayNumber: typeof payload.dayNumber === "number" ? payload.dayNumber : null,
      dayTitle: typeof payload.dayTitle === "string" ? payload.dayTitle : null,
      stopIds: Array.isArray(payload.stopIds) ? payload.stopIds.filter((value): value is string => typeof value === "string") : [],
      createdAt: log.createdAt
    };
  }
}
