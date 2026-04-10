import { shareListService } from "@/server/services/lists/share-list.service";
import { prisma } from "@/lib/db/prisma";
import { sendEmailMagicLink } from "@/lib/auth/auth";
import { ListInviteRepository } from "@/server/repositories/list-invite.repository";
import { ListMemberRepository } from "@/server/repositories/list-member.repository";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    listMember: { findUnique: vi.fn() },
    list: { findUnique: vi.fn() }
  }
}));
vi.mock("@/lib/auth/auth", () => ({
  sendEmailMagicLink: vi.fn()
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
vi.mock("@/server/repositories/list-invite.repository");
vi.mock("@/server/repositories/activity-log.repository");

describe("shareListService", () => {
  it("allows owners to share a list with an existing user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_2" } as never);
    vi.mocked(prisma.listMember.findUnique).mockResolvedValue(null);
    vi.mocked(ListMemberRepository.prototype.addMember).mockResolvedValue({ id: "membership_1" } as never);

    const result = await shareListService("list_1", { id: "owner", email: "owner@example.com" }, { email: "new@example.com", role: "EDITOR" });

    expect(ListMemberRepository.prototype.addMember).toHaveBeenCalledWith({
      listId: "list_1",
      userId: "user_2",
      role: "EDITOR"
    });
    expect(ListInviteRepository.prototype.markAcceptedByListAndEmail).toHaveBeenCalledWith({
      listId: "list_1",
      email: "new@example.com"
    });
    expect(result.kind).toBe("member_added");
  });

  it("sends a magic link invite for an unknown email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.list.findUnique).mockResolvedValue({ name: "Shared trip" } as never);
    vi.mocked(ListInviteRepository.prototype.upsertPendingInvite).mockResolvedValue({ id: "invite_1" } as never);

    const result = await shareListService("list_1", { id: "owner", email: "owner@example.com" }, { email: "new@example.com", role: "VIEWER" });

    expect(ListInviteRepository.prototype.upsertPendingInvite).toHaveBeenCalledWith({
      listId: "list_1",
      email: "new@example.com",
      role: "VIEWER",
      invitedByUserId: "owner"
    });
    expect(sendEmailMagicLink).toHaveBeenCalled();
    expect(result.kind).toBe("invite_sent");
  });

  it("rejects duplicate membership with the same role", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_2" } as never);
    vi.mocked(prisma.listMember.findUnique).mockResolvedValue({ id: "existing", role: "VIEWER" } as never);

    await expect(
      shareListService("list_1", { id: "owner", email: "owner@example.com" }, { email: "new@example.com", role: "VIEWER" })
    ).rejects.toThrow("already has access");

    expect(ListInviteRepository.prototype.markAcceptedByListAndEmail).toHaveBeenCalledWith({
      listId: "list_1",
      email: "new@example.com"
    });
  });
});
