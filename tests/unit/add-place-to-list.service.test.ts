import { Prisma } from "@prisma/client";
import { addPlaceToListService } from "@/server/services/list-places/add-place-to-list.service";
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

describe("addPlaceToListService", () => {
  it("adds a place to a list", async () => {
    vi.mocked(ListPlaceRepository.prototype.add).mockResolvedValue({ id: "lp_1" } as never);

    const result = await addPlaceToListService(
      { id: "editor", email: "editor@example.com" },
      {
        listId: "11111111-1111-4111-8111-111111111111",
        placeId: "22222222-2222-4222-8222-222222222222",
        priority: 2
      }
    );

    expect(ListPlaceRepository.prototype.add).toHaveBeenCalled();
    expect(ActivityLogRepository.prototype.create).toHaveBeenCalled();
    expect(result.id).toBe("lp_1");
  });

  it("prevents duplicate list-place pairs", async () => {
    vi.mocked(ListPlaceRepository.prototype.add).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("duplicate", { code: "P2002", clientVersion: "test" })
    );

    await expect(
      addPlaceToListService(
        { id: "editor", email: "editor@example.com" },
        {
          listId: "11111111-1111-4111-8111-111111111111",
          placeId: "22222222-2222-4222-8222-222222222222"
        }
      )
    ).rejects.toThrow("already linked");
  });
});
