import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";

export const listPlacePreferenceValues = ["TODAY", "LATER", "MUST_SEE", "SKIP_FOR_NOW"] as const;
export type ListPlacePreferenceValue = (typeof listPlacePreferenceValues)[number];

const actionType = "list.place_preference_set";

const activityLogRepository = new ActivityLogRepository();

function readPreference(value: unknown): ListPlacePreferenceValue | null {
  if (typeof value !== "string") {
    return null;
  }

  return listPlacePreferenceValues.includes(value as ListPlacePreferenceValue) ? (value as ListPlacePreferenceValue) : null;
}

export class ListPlacePreferenceRepository {
  async save(input: {
    actorUserId: string;
    listId: string;
    listPlaceId: string;
    preference: ListPlacePreferenceValue;
  }) {
    return activityLogRepository.create({
      actorUserId: input.actorUserId,
      listId: input.listId,
      entityType: "PLACE",
      entityId: input.listPlaceId,
      actionType,
      payloadJson: {
        preference: input.preference
      }
    });
  }

  async listLatestForUser(input: { userId: string; listId: string; listPlaceIds: string[] }) {
    if (input.listPlaceIds.length === 0) {
      return new Map<string, ListPlacePreferenceValue>();
    }

    const logs = await activityLogRepository.listPlacePreferenceLogs({
      listId: input.listId,
      listPlaceIds: input.listPlaceIds,
      actionType,
      actorUserId: input.userId
    });

    const preferences = new Map<string, ListPlacePreferenceValue>();

    for (const log of logs) {
      if (preferences.has(log.entityId)) {
        continue;
      }

      const preference = readPreference((log.payloadJson as { preference?: unknown } | null)?.preference);

      if (preference) {
        preferences.set(log.entityId, preference);
      }
    }

    return preferences;
  }

  async listGroupInsights(input: { listId: string; listPlaceIds: string[] }) {
    if (input.listPlaceIds.length === 0) {
      return new Map<
        string,
        {
          todayCount: number;
          laterCount: number;
          mustSeeCount: number;
          skipCount: number;
        }
      >();
    }

    const logs = await activityLogRepository.listPlacePreferenceLogs({
      listId: input.listId,
      listPlaceIds: input.listPlaceIds,
      actionType
    });

    const latestByActorAndPlace = new Map<string, ListPlacePreferenceValue>();

    for (const log of logs) {
      const key = `${log.actorUserId}:${log.entityId}`;

      if (latestByActorAndPlace.has(key)) {
        continue;
      }

      const preference = readPreference((log.payloadJson as { preference?: unknown } | null)?.preference);

      if (preference) {
        latestByActorAndPlace.set(key, preference);
      }
    }

    const insights = new Map<
      string,
      {
        todayCount: number;
        laterCount: number;
        mustSeeCount: number;
        skipCount: number;
      }
    >();

    for (const listPlaceId of input.listPlaceIds) {
      insights.set(listPlaceId, {
        todayCount: 0,
        laterCount: 0,
        mustSeeCount: 0,
        skipCount: 0
      });
    }

    for (const [key, preference] of latestByActorAndPlace.entries()) {
      const listPlaceId = key.split(":")[1];
      const current = insights.get(listPlaceId);

      if (!current) {
        continue;
      }

      if (preference === "TODAY") {
        current.todayCount += 1;
      } else if (preference === "LATER") {
        current.laterCount += 1;
      } else if (preference === "MUST_SEE") {
        current.mustSeeCount += 1;
      } else if (preference === "SKIP_FOR_NOW") {
        current.skipCount += 1;
      }
    }

    return insights;
  }
}
