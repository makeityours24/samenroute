import { canManageMembers, canMutateList, canReadList } from "@/server/domain/policies/list-policy";

describe("list policy", () => {
  const editorMembership = { listId: "list_1", ownerUserId: "owner", membershipRole: "EDITOR" as const };
  const viewerMembership = { listId: "list_1", ownerUserId: "owner", membershipRole: "VIEWER" as const };

  it("allows owners and editors to mutate list content", () => {
    expect(canMutateList("owner", viewerMembership)).toBe(true);
    expect(canMutateList("editor", editorMembership)).toBe(true);
  });

  it("prevents viewers from mutating list content", () => {
    expect(canMutateList("viewer", viewerMembership)).toBe(false);
  });

  it("allows only owners to manage members", () => {
    expect(canManageMembers("owner", viewerMembership)).toBe(true);
    expect(canManageMembers("editor", editorMembership)).toBe(false);
  });

  it("allows viewers to read shared content", () => {
    expect(canReadList("viewer", viewerMembership)).toBe(true);
  });
});
