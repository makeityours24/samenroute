import { TransportMode } from "@/server/domain/enums";

type GoogleMapsWaypoint = {
  label: string;
  latitude?: number | null;
  longitude?: number | null;
};

const transportModeMap: Record<TransportMode, string> = {
  [TransportMode.DRIVING]: "driving",
  [TransportMode.WALKING]: "walking",
  [TransportMode.BICYCLING]: "bicycling",
  [TransportMode.TRANSIT]: "transit"
};

function encodeWaypoint(waypoint: GoogleMapsWaypoint): string {
  if (typeof waypoint.latitude === "number" && typeof waypoint.longitude === "number") {
    return `${waypoint.latitude},${waypoint.longitude}`;
  }

  return waypoint.label;
}

export function buildGoogleMapsDirectionsUrl(input: {
  transportMode: TransportMode;
  start?: GoogleMapsWaypoint;
  stops: GoogleMapsWaypoint[];
}) {
  const [destination, ...waypoints] = input.stops;

  if (!destination) {
    return null;
  }

  const params = new URLSearchParams({
    api: "1",
    destination: encodeWaypoint(destination),
    travelmode: transportModeMap[input.transportMode]
  });

  if (input.start) {
    params.set("origin", encodeWaypoint(input.start));
  }

  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.map(encodeWaypoint).join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
