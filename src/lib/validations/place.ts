import { PlaceSourceType } from "@/server/domain/enums";
import { z } from "zod";

const coordinateSchema = z.number().gte(-180).lte(180);

export const createPlaceSchema = z.object({
  sourceType: z.nativeEnum(PlaceSourceType),
  externalSourceId: z.string().trim().max(120).optional(),
  name: z.string().trim().min(1).max(120),
  addressLine: z.string().trim().max(160).optional(),
  postalCode: z.string().trim().max(24).optional(),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  latitude: coordinateSchema.optional(),
  longitude: coordinateSchema.optional(),
  googleMapsUrl: z.string().url().optional(),
  categoryId: z.string().uuid().optional()
});

export const updatePlaceSchema = createPlaceSchema
  .omit({ sourceType: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field must be provided.");
