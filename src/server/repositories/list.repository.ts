import { prisma } from "@/lib/db/prisma";
import { ListMemberRole, ListPlaceStatus } from "@/server/domain/enums";

export class ListRepository {
  async create(input: {
    ownerUserId: string;
    name: string;
    description?: string;
    coverColor?: string;
  }) {
    return prisma.list.create({
      data: {
        ownerUserId: input.ownerUserId,
        name: input.name,
        description: input.description,
        coverColor: input.coverColor,
        members: {
          create: {
            userId: input.ownerUserId,
            role: ListMemberRole.OWNER
          }
        }
      }
    });
  }

  async update(listId: string, input: { name?: string; description?: string | null; coverColor?: string | null }) {
    return prisma.list.update({
      where: { id: listId },
      data: input
    });
  }

  async archive(listId: string) {
    return prisma.list.update({
      where: { id: listId },
      data: { isArchived: true }
    });
  }

  async duplicate(listId: string, ownerUserId: string, name: string) {
    const source = await prisma.list.findUniqueOrThrow({
      where: { id: listId },
      include: {
        listPlaces: true
      }
    });

    return prisma.list.create({
      data: {
        ownerUserId,
        name,
        description: source.description,
        coverColor: source.coverColor,
        members: {
          create: {
            userId: ownerUserId,
            role: ListMemberRole.OWNER
          }
        },
        listPlaces: {
          create: source.listPlaces.map((listPlace) => ({
            placeId: listPlace.placeId,
            note: listPlace.note,
            priority: listPlace.priority,
            sortOrder: listPlace.sortOrder,
            status: ListPlaceStatus.PLANNED,
            includeInRoute: listPlace.includeInRoute,
            isFavorite: listPlace.isFavorite
          }))
        }
      }
    });
  }

  async findAccessibleByUser(userId: string) {
    return prisma.list.findMany({
      where: {
        OR: [{ ownerUserId: userId }, { members: { some: { userId } } }]
      },
      include: {
        members: true,
        _count: {
          select: {
            listPlaces: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  async findDetail(listId: string, userId: string) {
    return prisma.list.findFirst({
      where: {
        id: listId,
        OR: [{ ownerUserId: userId }, { members: { some: { userId } } }]
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        listPlaces: {
          include: {
            place: {
              include: {
                category: true,
                createdByUser: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            visitedByUser: true
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
        },
        routePlans: {
          where: {
            status: {
              in: ["ACTIVE", "DRAFT"]
            }
          },
          include: {
            stops: {
              include: {
                listPlace: {
                  include: {
                    place: true
                  }
                }
              },
              orderBy: {
                stopOrder: "asc"
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });
  }

  async getMembershipContext(listId: string, userId: string) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        members: {
          where: { userId }
        }
      }
    });

    if (!list) {
      return null;
    }

    return {
      listId: list.id,
      ownerUserId: list.ownerUserId,
      membershipRole:
        list.ownerUserId === userId ? ListMemberRole.OWNER : (list.members[0]?.role ?? undefined)
    };
  }

  async getHomeSummary(userId: string) {
    return prisma.list.findFirst({
      where: {
        isArchived: false,
        OR: [{ ownerUserId: userId }, { members: { some: { userId } } }]
      },
      include: {
        listPlaces: {
          include: {
            place: true
          },
          orderBy: [{ visitedAt: "desc" }, { createdAt: "desc" }],
          take: 6
        },
        routePlans: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            stops: {
              include: {
                listPlace: {
                  include: {
                    place: true
                  }
                }
              },
              orderBy: {
                stopOrder: "asc"
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }
}
