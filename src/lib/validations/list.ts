import { ListMemberRole } from "@/server/domain/enums";
import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional(),
  coverColor: z.string().trim().regex(/^#([0-9A-Fa-f]{6})$/).optional()
});

export const updateListSchema = createListSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided."
);

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(ListMemberRole).refine((role) => role !== ListMemberRole.OWNER, {
    message: "Only the list owner can remain owner."
  })
});
