import type {
  ActivityLog,
  Category,
  List,
  ListMember,
  ListPlace,
  Place,
  RoutePlan,
  RoutePlanStop,
  User
} from "@prisma/client";

export type UserEntity = User;
export type ListEntity = List;
export type ListMemberEntity = ListMember;
export type CategoryEntity = Category;
export type PlaceEntity = Place;
export type ListPlaceEntity = ListPlace;
export type RoutePlanEntity = RoutePlan;
export type RoutePlanStopEntity = RoutePlanStop;
export type ActivityLogEntity = ActivityLog;

export type AuthorizedUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type MembershipContext = {
  listId: string;
  ownerUserId: string;
  membershipRole?: "OWNER" | "EDITOR" | "VIEWER";
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type RouteCandidate = {
  listPlaceId: string;
  priority: number;
  sortOrder: number;
  name: string;
  coordinates?: Coordinates;
};
