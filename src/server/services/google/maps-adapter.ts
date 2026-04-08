import type { TransportMode } from "@/server/domain/enums";
import { buildGoogleMapsDirectionsUrl } from "@/server/services/google/maps-url.builder";

export class GoogleMapsAdapter {
  buildRouteUrl(input: {
    transportMode: TransportMode;
    start?: { label: string; latitude?: number | null; longitude?: number | null };
    stops: Array<{ label: string; latitude?: number | null; longitude?: number | null }>;
  }) {
    return buildGoogleMapsDirectionsUrl(input);
  }
}
