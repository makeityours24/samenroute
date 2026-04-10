import { generateRoutePlanService, orderRouteCandidates } from "@/server/services/routes/generate-route-plan.service";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";

vi.mock("@/server/repositories/list.repository", () => ({
  ListRepository: class {
    getMembershipContext = vi.fn().mockResolvedValue({
      listId: "list_1",
      ownerUserId: "owner",
      membershipRole: "EDITOR"
    });
  }
}));
vi.mock("@/server/repositories/list-place.repository");
vi.mock("@/server/repositories/route-plan.repository");
vi.mock("@/server/repositories/activity-log.repository");

describe("generateRoutePlanService", () => {
  it("orders candidates by priority and creates a snapshot route plan", async () => {
    vi.mocked(ListPlaceRepository.prototype.getRouteCandidates).mockResolvedValue([
      { id: "lp_1", priority: 1, sortOrder: 1, place: { name: "A", latitude: null, longitude: null } },
      { id: "lp_2", priority: 3, sortOrder: 2, place: { name: "B", latitude: null, longitude: null } }
    ] as never);
    vi.mocked(RoutePlanRepository.prototype.create).mockResolvedValue({ id: "route_1", stops: [{}, {}] } as never);

    const result = await generateRoutePlanService(
      { id: "editor", email: "editor@example.com" },
      {
        title: "Vandaag",
        transportMode: "WALKING",
        routeOrderingStrategy: "PRIORITY_FIRST",
        listId: "11111111-1111-4111-8111-111111111111",
        listPlaceIds: [
          "22222222-2222-4222-8222-222222222222",
          "33333333-3333-4333-8333-333333333333"
        ],
        maxStops: 2
      }
    );

    expect(RoutePlanRepository.prototype.create).toHaveBeenCalled();
    expect(ActivityLogRepository.prototype.create).toHaveBeenCalled();
    expect(result.id).toBe("route_1");
  });

  it("applies the maintainable fallback ordering strategy", () => {
    const ordered = orderRouteCandidates({
      transportMode: "WALKING",
      routeOrderingStrategy: "PRIORITY_FIRST",
      maxStops: 2,
      candidates: [
        { id: "lp_1", priority: 0, sortOrder: 5, place: { name: "Later", latitude: null, longitude: null } },
        { id: "lp_2", priority: 4, sortOrder: 8, place: { name: "Sooner", latitude: null, longitude: null } }
      ]
    });

    expect(ordered.map((item) => item.id)).toEqual(["lp_2", "lp_1"]);
  });

  it("supports manual ordering when the user prefers list order", () => {
    const ordered = orderRouteCandidates({
      transportMode: "WALKING",
      routeOrderingStrategy: "MANUAL",
      maxStops: 3,
      candidates: [
        { id: "lp_1", priority: 5, sortOrder: 2, place: { name: "Third", latitude: null, longitude: null } },
        { id: "lp_2", priority: 0, sortOrder: 0, place: { name: "First", latitude: null, longitude: null } },
        { id: "lp_3", priority: 2, sortOrder: 1, place: { name: "Second", latitude: null, longitude: null } }
      ]
    });

    expect(ordered.map((item) => item.id)).toEqual(["lp_2", "lp_3", "lp_1"]);
  });

  it("uses a nearest-neighbor path for fastest routes when a start point is given", () => {
    const ordered = orderRouteCandidates({
      transportMode: "WALKING",
      routeOrderingStrategy: "FASTEST",
      maxStops: 3,
      start: { latitude: 0, longitude: 0 },
      candidates: [
        { id: "lp_1", priority: 0, sortOrder: 0, place: { name: "Far", latitude: 10, longitude: 10 } },
        { id: "lp_2", priority: 0, sortOrder: 1, place: { name: "Near", latitude: 1, longitude: 1 } },
        { id: "lp_3", priority: 0, sortOrder: 2, place: { name: "Middle", latitude: 2, longitude: 2 } }
      ]
    });

    expect(ordered.map((item) => item.id)).toEqual(["lp_2", "lp_3", "lp_1"]);
  });

  it("finds a shortest open path for fastest routes when no start point is given", () => {
    const ordered = orderRouteCandidates({
      transportMode: "WALKING",
      routeOrderingStrategy: "FASTEST",
      maxStops: 4,
      candidates: [
        { id: "lp_1", priority: 0, sortOrder: 0, place: { name: "A", latitude: 0, longitude: 0 } },
        { id: "lp_2", priority: 0, sortOrder: 1, place: { name: "B", latitude: 1, longitude: 0 } },
        { id: "lp_3", priority: 0, sortOrder: 2, place: { name: "C", latitude: 2, longitude: 0 } },
        { id: "lp_4", priority: 0, sortOrder: 3, place: { name: "No coords", latitude: null, longitude: null } }
      ]
    });

    expect([
      ["lp_1", "lp_2", "lp_3", "lp_4"],
      ["lp_3", "lp_2", "lp_1", "lp_4"]
    ]).toContainEqual(ordered.map((item) => item.id));
  });
});
