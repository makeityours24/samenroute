import { z } from "zod";
import type { AuthorizedUser } from "@/server/domain/types";
import { ListDayPlanSelectionRepository } from "@/server/repositories/list-day-plan-selection.repository";
import { requireMutableList } from "@/server/services/shared";

const confirmDayPlanSchema = z.object({
  listId: z.string().uuid(),
  dayNumber: z.number().int().min(1),
  dayTitle: z.string().trim().min(1).max(120),
  stopIds: z.array(z.string().uuid()).min(1)
});

const listDayPlanSelectionRepository = new ListDayPlanSelectionRepository();

export async function confirmDayPlanService(user: AuthorizedUser, input: unknown) {
  const data = confirmDayPlanSchema.parse(input);
  await requireMutableList(data.listId, user);

  await listDayPlanSelectionRepository.confirm({
    actorUserId: user.id,
    listId: data.listId,
    dayNumber: data.dayNumber,
    dayTitle: data.dayTitle,
    stopIds: data.stopIds
  });
}
