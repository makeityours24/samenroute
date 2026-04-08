import { z } from "zod";

export const addPlaceToListSchema = z.object({
  listId: z.string().uuid(),
  placeId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
  priority: z.number().int().min(0).max(5).default(0),
  includeInRoute: z.boolean().default(true),
  isFavorite: z.boolean().default(false)
});

export const updateListPlaceSchema = z
  .object({
    note: z.string().trim().max(500).nullable().optional(),
    priority: z.number().int().min(0).max(5).optional(),
    includeInRoute: z.boolean().optional(),
    isFavorite: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field must be provided.");

export const markVisitedSchema = z.object({
  listPlaceId: z.string().uuid()
});

export const markSkippedSchema = z.object({
  listPlaceId: z.string().uuid()
});
