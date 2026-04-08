import { TransportMode } from "@/server/domain/enums";
import { z } from "zod";

export const routeOrderingStrategySchema = z.enum(["FASTEST", "PRIORITY_FIRST", "MANUAL"]);

export const generateRoutePlanSchema = z.object({
  listId: z.string().uuid(),
  title: z.string().trim().min(1).max(100),
  transportMode: z.nativeEnum(TransportMode),
  routeOrderingStrategy: routeOrderingStrategySchema.default("FASTEST"),
  listPlaceIds: z.array(z.string().uuid()).min(1).max(10),
  maxStops: z.number().int().min(1).max(10),
  startPlaceLabel: z.string().trim().max(120).optional(),
  startLatitude: z.number().gte(-90).lte(90).optional(),
  startLongitude: z.number().gte(-180).lte(180).optional()
});

export const completeRouteStopSchema = z.object({
  routePlanId: z.string().uuid(),
  routePlanStopId: z.string().uuid(),
  listPlaceId: z.string().uuid()
});
