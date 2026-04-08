import { afterEach, vi } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    list: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn() },
    listMember: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findUnique: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn() },
    place: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), createManyAndReturn: vi.fn(), deleteMany: vi.fn() },
    listPlace: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn()
    },
    routePlan: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    routePlanStop: { update: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn() },
    activityLog: { create: vi.fn(), findMany: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn() },
    category: { findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    account: { deleteMany: vi.fn() },
    session: { deleteMany: vi.fn() },
    verificationToken: { deleteMany: vi.fn() },
    $transaction: vi.fn(async (items: unknown) => items)
  }
}));

afterEach(() => {
  vi.clearAllMocks();
});
