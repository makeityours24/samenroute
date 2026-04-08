import { createListService } from "@/server/services/lists/create-list.service";
import { ListRepository } from "@/server/repositories/list.repository";
import { ActivityLogRepository } from "@/server/repositories/activity-log.repository";

vi.mock("@/server/repositories/list.repository");
vi.mock("@/server/repositories/activity-log.repository");

describe("createListService", () => {
  it("creates a list and writes an activity log", async () => {
    vi.mocked(ListRepository.prototype.create).mockResolvedValue({
      id: "list_1",
      name: "Weekend"
    } as never);
    vi.mocked(ActivityLogRepository.prototype.create).mockResolvedValue({} as never);

    const result = await createListService(
      { id: "user_1", email: "demo@example.com" },
      { name: "Weekend", description: "Test" }
    );

    expect(ListRepository.prototype.create).toHaveBeenCalledWith({
      ownerUserId: "user_1",
      name: "Weekend",
      description: "Test",
      coverColor: undefined
    });
    expect(ActivityLogRepository.prototype.create).toHaveBeenCalled();
    expect(result.id).toBe("list_1");
  });
});
