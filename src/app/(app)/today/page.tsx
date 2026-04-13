import { AppTopBar } from "@/components/navigation/app-topbar";
import { BehaviorInsightsCard } from "@/components/behavior/behavior-insights-card";
import { DayPlanSuggestionsCard } from "@/components/today/day-plan-suggestions-card";
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
import { getUserBehaviorInsightsService } from "@/server/services/behavior/get-user-behavior-insights.service";
import { suggestDayPlans } from "@/server/services/routes/suggest-day-plans.service";

const listRepository = new ListRepository();

export default async function TodayPage({
  searchParams
}: {
  searchParams?: Promise<{ listId?: string; error?: string; day?: string }>;
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
  const selectedDay = Number(params?.day ?? "");
  const defaultList = requestedListId
    ? mutableLists.find((list) => list.id === requestedListId) ?? mutableLists[0]
    : mutableLists[0];
  const detail = defaultList && user ? await listRepository.findDetail(defaultList.id, user.id) : null;
  const behavior =
    user && detail
      ? await getUserBehaviorInsightsService(
          user.id,
          detail.listPlaces.map((item) => ({
            id: item.id,
            status: item.status,
            priority: item.priority,
            includeInRoute: item.includeInRoute,
            isFavorite: item.isFavorite,
            createdAt: item.createdAt,
            place: {
              category: item.place.category ? { name: item.place.category.name } : null
            }
          }))
        )
      : user
        ? await getUserBehaviorInsightsService(user.id)
        : null;
  const recommendedStopIds = new Set(behavior?.recommendedListPlaceIds ?? []);
  const hasSuggestedDayPlan = !detail?.routePlans[0] && recommendedStopIds.size > 0;
  const dayPlans =
    detail && behavior
      ? suggestDayPlans({
          candidates: detail.listPlaces
            .filter((item) => item.status === "PLANNED")
            .map((item) => ({
              id: item.id,
              priority: item.priority,
              sortOrder: item.sortOrder,
              place: {
                name: item.place.name,
                latitude: item.place.latitude,
                longitude: item.place.longitude,
                categoryName: item.place.category?.name
              }
            })),
          stopsPerDay: behavior.recommendedDayStopCount,
          transportMode: behavior.recommendedTransportMode
        })
      : [];
  const selectedDayPlan = dayPlans.find((plan) => plan.dayNumber === selectedDay);
  const selectedDayStopIds = new Set(selectedDayPlan?.stopIds ?? []);
  const plannerStops = detail
    ? detail.listPlaces
        .filter((item) => item.status === "PLANNED")
        .map((item) => ({
          id: item.id,
          name: item.place.name,
          detail: recommendedStopIds.has(item.id)
            ? `${dict.today.recommendedStopLabel} • ${dict.listDetail.priorityLabel} ${item.priority}`
            : `${dict.listDetail.priorityLabel} ${item.priority}`,
          defaultChecked: selectedDayPlan
            ? selectedDayStopIds.has(item.id)
            : hasSuggestedDayPlan
              ? recommendedStopIds.has(item.id)
              : item.includeInRoute,
          recommended: recommendedStopIds.has(item.id)
        }))
        .sort((left, right) => Number(right.recommended) - Number(left.recommended))
    : [];

  return (
    <PageContainer className="gap-4">
      <AppTopBar title={dict.today.topTitle} subtitle={dict.today.topSubtitle} />
      {detail ? (
        <>
          {behavior ? (
            <BehaviorInsightsCard
              title={dict.today.behaviorTitle}
              subtitle={dict.today.behaviorSubtitle}
              categories={behavior.topCategories}
              topCategoriesLabel={dict.today.behaviorTopCategories}
              favoritesLabel={dict.today.behaviorFavorites}
              favoritesCount={behavior.favoriteCount}
              visitsLabel={dict.today.behaviorVisits}
              visitsCount={behavior.visitedCount}
            />
          ) : null}
          {dayPlans.length > 1 ? (
            <DayPlanSuggestionsCard
              listId={detail.id}
              plans={dayPlans}
              selectedDay={selectedDayPlan?.dayNumber}
              copy={{
                badge: dict.today.dayPlansBadge,
                title: dict.today.dayPlansTitle,
                subtitle: dict.today.dayPlansSubtitle.replace("{count}", String(dayPlans.length)),
                stops: dict.today.stops,
                chooseDay: dict.today.dayPlansChooseDay,
                selected: dict.today.dayPlansSelected,
                calmType: dict.today.dayPlansCalmType,
                balancedType: dict.today.dayPlansBalancedType,
                highlightsType: dict.today.dayPlansHighlightsType,
                cultureTheme: dict.today.dayPlansCultureTheme,
                foodWalkTheme: dict.today.dayPlansFoodWalkTheme,
                outdoorTheme: dict.today.dayPlansOutdoorTheme,
                mixTheme: dict.today.dayPlansMixTheme
              }}
            />
          ) : null}
          <PlannerForm
            action={generateRouteAction}
            lists={mutableLists.map((list) => ({ id: list.id, name: list.name }))}
            selectedListId={detail.id}
            initialError={params?.error === "no-stops" ? dict.today.selectAtLeastOneStop : undefined}
            submitLabel={dict.today.generateRoute}
            stops={plannerStops}
            initialMaxStops={selectedDayPlan ? selectedDayPlan.stopIds.length : hasSuggestedDayPlan ? recommendedStopIds.size : undefined}
            initialTransportMode={behavior?.recommendedTransportMode}
            suggestionSummary={
              selectedDayPlan
                ? dict.today.dayPlansActiveSummary
                    .replace("{day}", selectedDayPlan.title)
                    .replace("{count}", String(selectedDayPlan.stopIds.length))
                    .replace(
                      "{type}",
                      selectedDayPlan.dayType === "CALM"
                        ? dict.today.dayPlansCalmType
                        : selectedDayPlan.dayType === "HIGHLIGHTS"
                          ? dict.today.dayPlansHighlightsType
                          : dict.today.dayPlansBalancedType
                    )
                    .replace(
                      "{theme}",
                      selectedDayPlan.dayTheme === "CULTURE"
                        ? dict.today.dayPlansCultureTheme
                        : selectedDayPlan.dayTheme === "FOOD_WALK"
                          ? dict.today.dayPlansFoodWalkTheme
                          : selectedDayPlan.dayTheme === "OUTDOOR"
                            ? dict.today.dayPlansOutdoorTheme
                            : dict.today.dayPlansMixTheme
                    )
              : hasSuggestedDayPlan
                ? dict.today.smartProposalSummary
                    .replace("{count}", String(recommendedStopIds.size))
                    .replace("{pace}", String(behavior?.recommendedDayStopCount ?? recommendedStopIds.size))
                : undefined
            }
            transportSuggestionSummary={
              behavior
                ? dict.today.transportSuggestionSummary.replace(
                    "{mode}",
                    behavior.recommendedTransportMode === "BICYCLING"
                      ? dict.today.bicycling
                      : behavior.recommendedTransportMode === "DRIVING"
                        ? dict.today.driving
                        : behavior.recommendedTransportMode === "TRANSIT"
                          ? dict.today.transit
                          : dict.today.walking
                  )
                : undefined
            }
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
