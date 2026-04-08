import { shareListService } from "@/server/services/lists/share-list.service";
import { prisma } from "@/lib/db/prisma";
import { ListMemberRepository } from "@/server/repositories/list-member.repository";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    listMember: { findUnique: vi.fn() }
  }
}));
vi.mock("@/server/repositories/list.repository", () => ({
  ListRepository: class {
    getMembershipContext = vi.fn().mockResolvedValue({
      listId: "list_1",
      ownerUserId: "owner",
      membershipRole: "OWNER"
    });
  }
}));
vi.mock("@/server/repositories/list-member.repository");
vi.mock("@/server/repositories/activity-log.repository");

describe("shareListService", () => {
  it("allows owners to share a list", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_2" } as never);
    vi.mocked(prisma.listMember.findUnique).mockResolvedValue(null);
    vi.mocked(ListMemberRepository.prototype.addMember).mockResolvedValue({ id: "membership_1" } as never);

    await shareListService("list_1", { id: "owner", email: "owner@example.com" }, { email: "new@example.com", role: "EDITOR" });

    expect(ListMemberRepository.prototype.addMember).toHaveBeenCalledWith({
      listId: "list_1",
      userId: "user_2",
      role: "EDITOR"
    });
  });

  it("rejects duplicate membership", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_2" } as never);
    vi.mocked(prisma.listMember.findUnique).mockResolvedValue({ id: "existing" } as never);

    await expect(
      shareListService("list_1", { id: "owner", email: "owner@example.com" }, { email: "new@example.com", role: "VIEWER" })
    ).rejects.toThrow("already on the list");
  });
});
