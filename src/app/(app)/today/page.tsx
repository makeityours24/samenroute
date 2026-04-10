import { AppTopBar } from "@/components/navigation/app-topbar";
import { PlannerForm } from "@/components/today/planner-form";
import { RoutePreviewCard } from "@/components/today/route-preview-card";
import { getCurrentUser } from "@/lib/auth/auth";
import { ListRepository } from "@/server/repositories/list.repository";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { generateRouteAction } from "@/app/(app)/actions";
import { canMutateList } from "@/server/domain/policies/list-policy";
import { ListMemberRole } from "@/server/domain/enums";
import { getDictionary } from "@/lib/i18n/server";

const listRepository = new ListRepository();

export default async function TodayPage({
  searchParams
}: {
  searchParams?: Promise<{ listId?: string; error?: string }>;
}) {
  const { dict } = await getDictionary();
  const params = searchParams ? await searchParams : undefined;
  const user = await getCurrentUser();
  const lists = user ? await listRepository.findAccessibleByUser(user.id) : [];
  const mutableLists = user
    ? lists.filter((list) =>
        canMutateList(user.id, {
          listId: list.id,
          ownerUserId: list.ownerUserId,
          membershipRole:
            list.ownerUserId === user.id
              ? ListMemberRole.OWNER
              : (list.members.find((member) => member.userId === user.id)?.role ?? undefined)
        })
      )
    : [];
  const requestedListId = params?.listId;
  const defaultList = requestedListId
    ? mutableLists.find((list) => list.id === requestedListId) ?? mutableLists[0]
    : mutableLists[0];
  const detail = defaultList && user ? await listRepository.findDetail(defaultList.id, user.id) : null;

  return (
    <PageContainer className="gap-4">
      <AppTopBar title={dict.today.topTitle} subtitle={dict.today.topSubtitle} />
      {detail ? (
        <>
          <PlannerForm
            action={generateRouteAction}
            lists={mutableLists.map((list) => ({ id: list.id, name: list.name }))}
            selectedListId={detail.id}
            initialError={params?.error === "no-stops" ? dict.today.selectAtLeastOneStop : undefined}
            submitLabel={dict.today.generateRoute}
            stops={detail.listPlaces
              .filter((item) => item.status === "PLANNED")
              .map((item) => ({
                id: item.id,
                name: item.place.name,
                detail: `${dict.listDetail.priorityLabel} ${item.priority}`,
                defaultChecked: item.includeInRoute
              }))}
            copy={dict.today}
          />
          {detail.routePlans[0] ? (
            <section className="space-y-3">
              <SectionHeader title={dict.today.currentProposal} subtitle={dict.today.currentProposalSubtitle} />
              <RoutePreviewCard
                title={detail.routePlans[0].title ?? dict.today.savedRoute}
                mapsUrl={detail.routePlans[0].googleMapsUrl}
                routeHref={`/route/${detail.routePlans[0].id}`}
                stops={detail.routePlans[0].stops.map((stop) => stop.listPlace.place.name)}
                copy={{
                  badge: dict.today.routePreview,
                  stops: dict.today.stops,
                  openMaps: dict.today.openGoogleMaps,
                  openProposal: dict.today.openProposal,
                  helper: dict.today.routePreviewHelper
                }}
              />
            </section>
          ) : null}
        </>
      ) : (
        <EmptyState
          title={lists.length > 0 ? dict.today.noEditableList : dict.today.nothingToPlan}
          description={
            lists.length > 0
              ? dict.today.noEditableListBody
              : dict.today.nothingToPlanBody
          }
        />
      )}
    </PageContainer>
  );
}
