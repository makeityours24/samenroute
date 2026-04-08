import { markListPlaceSkippedService } from "@/server/services/list-places/mark-list-place-skipped.service";
import { markListPlaceVisitedService } from "@/server/services/list-places/mark-list-place-visited.service";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
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
vi.mock("@/server/repositories/activity-log.repository");

describe("list place status services", () => {
  it("marks a list place visited", async () => {
    vi.mocked(ListPlaceRepository.prototype.findById).mockResolvedValue({
      id: "22222222-2222-4222-8222-222222222222",
      listId: "list_1"
    } as never);
    vi.mocked(ListPlaceRepository.prototype.markVisited).mockResolvedValue({ visitedAt: new Date() } as never);

    await markListPlaceVisitedService(
      { id: "editor", email: "editor@example.com" },
      { listPlaceId: "22222222-2222-4222-8222-222222222222" }
    );

    expect(ListPlaceRepository.prototype.markVisited).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
      "editor"
    );
    expect(ActivityLogRepository.prototype.create).toHaveBeenCalled();
  });

  it("marks a list place skipped", async () => {
    vi.mocked(ListPlaceRepository.prototype.findById).mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333",
      listId: "list_1"
    } as never);
    vi.mocked(ListPlaceRepository.prototype.markSkipped).mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333"
    } as never);

    await markListPlaceSkippedService(
      { id: "editor", email: "editor@example.com" },
      { listPlaceId: "33333333-3333-4333-8333-333333333333" }
    );

    expect(ListPlaceRepository.prototype.markSkipped).toHaveBeenCalledWith("33333333-3333-4333-8333-333333333333");
  });
});
